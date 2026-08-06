<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { ExternalLink, MapPin, Search } from "@lucide/vue";

const props = defineProps({
  address: {
    type: String,
    default: ""
  },
  googleMapsUrl: {
    type: String,
    default: ""
  },
  disabled: {
    type: Boolean,
    default: false
  },
  addressError: {
    type: String,
    default: ""
  },
  addressClass: {
    type: [String, Array, Object],
    default: ""
  },
  addressInvalid: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["update:address", "update:googleMapsUrl"]);

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const allowedHosts = parseAllowedHosts(import.meta.env.VITE_GOOGLE_MAPS_ALLOWED_HOSTS);
const hasMapsApiKey = computed(() => Boolean(apiKey));
const isHostAllowed = computed(() => allowedHosts.length === 0 || allowedHosts.includes(window.location.hostname));
const canUseInteractiveMap = computed(() => hasMapsApiKey.value && isHostAllowed.value);
const searchQuery = ref("");
const mapElement = ref(null);
const searchInput = ref(null);
const mapStatus = ref("");
const interactiveMapReady = ref(false);
const interactiveMapFailed = ref(false);

let googleMap = null;
let marker = null;
let geocoder = null;
let mapLoadTimeout = null;

const shouldShowInteractiveMap = computed(() => canUseInteractiveMap.value && !interactiveMapFailed.value);

const fallbackMapUrl = computed(() => {
  const query = props.googleMapsUrl || props.address || "Indonesia";
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
});

const openMapsUrl = computed(() => {
  if (props.googleMapsUrl) {
    return props.googleMapsUrl;
  }

  if (props.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.address)}`;
  }

  return "https://www.google.com/maps";
});

onMounted(async () => {
  searchQuery.value = props.address;

  if (!hasMapsApiKey.value) {
    mapStatus.value = "API key Google Maps belum terbaca di frontend.";
    return;
  }

  if (!isHostAllowed.value) {
    mapStatus.value = "Google Maps tidak dimuat karena domain halaman ini belum diizinkan.";
    return;
  }

  try {
    window.gm_authFailure = () => {
      failInteractiveMap("Google Maps menolak API key. Cek restriction domain, billing, dan API yang diizinkan.");
    };
    await loadGoogleMaps();
    await nextTick();
    initializeMap();
  } catch {
    failInteractiveMap("Peta interaktif belum bisa dimuat. Cek API key, API yang aktif, billing, dan pembatasan domain.");
  }
});

onUnmounted(() => {
  if (mapLoadTimeout) {
    window.clearTimeout(mapLoadTimeout);
  }

  if (window.gm_authFailure) {
    window.gm_authFailure = undefined;
  }
});

watch(
  () => props.address,
  (value) => {
    searchQuery.value = value || "";
  }
);

function updateAddress(value) {
  emit("update:address", value);
}

function updateMapsUrl(value) {
  emit("update:googleMapsUrl", value);
}

function parseAllowedHosts(value) {
  if (!value) {
    return ["localhost", "127.0.0.1"];
  }

  return value
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

function loadGoogleMaps() {
  if (window.google?.maps?.Map) {
    return Promise.resolve();
  }

  if (window.__janjiNikahGoogleMapsPromise) {
    return window.__janjiNikahGoogleMapsPromise;
  }

  window.__janjiNikahGoogleMapsPromise = new Promise((resolve, reject) => {
    const callbackName = "__janjiNikahGoogleMapsReady";
    const script = document.createElement("script");
    let settled = false;

    const finish = (callback, value) => {
      if (settled) {
        return;
      }

      settled = true;

      if (mapLoadTimeout) {
        window.clearTimeout(mapLoadTimeout);
        mapLoadTimeout = null;
      }

      if (window[callbackName] === onReady) {
        window[callbackName] = undefined;
      }

      callback(value);
    };

    const onReady = () => {
      finish(resolve);
    };

    window[callbackName] = onReady;
    mapLoadTimeout = window.setTimeout(() => {
      finish(reject, new Error("Google Maps load timeout"));
    }, 12000);

    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&loading=async&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.referrerPolicy = "strict-origin-when-cross-origin";
    script.onerror = () => finish(reject, new Error("Google Maps script failed to load"));
    document.head.appendChild(script);
  }).then(() => {
    if (!window.google?.maps?.Map) {
      throw new Error("Google Maps API is not ready");
    }
  });

  return window.__janjiNikahGoogleMapsPromise;
}

function initializeMap() {
  if (!mapElement.value || !window.google?.maps?.Map) {
    failInteractiveMap("Peta interaktif belum siap. Coba refresh halaman atau cek konfigurasi Google Maps.");
    return;
  }

  const center = { lat: -6.2, lng: 106.816666 };
  geocoder = new window.google.maps.Geocoder();
  googleMap = new window.google.maps.Map(mapElement.value, {
    center,
    zoom: 13,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true
  });
  marker = new window.google.maps.Marker({
    map: googleMap,
    position: center,
    draggable: !props.disabled
  });
  interactiveMapReady.value = true;
  interactiveMapFailed.value = false;

  googleMap.addListener("click", (event) => {
    if (props.disabled) {
      return;
    }

    setLocationFromLatLng(event.latLng);
  });

  marker.addListener("dragend", (event) => {
    if (props.disabled) {
      return;
    }

    setLocationFromLatLng(event.latLng);
  });

  if (searchInput.value && window.google.maps.places?.Autocomplete) {
    const autocomplete = new window.google.maps.places.Autocomplete(searchInput.value, {
      fields: ["formatted_address", "geometry", "name", "place_id", "url"]
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      applyPlace(place);
    });
  }

  if (props.address) {
    searchAddress();
  }
}

function failInteractiveMap(message) {
  interactiveMapFailed.value = true;
  interactiveMapReady.value = false;
  mapStatus.value = message;

  if (mapLoadTimeout) {
    window.clearTimeout(mapLoadTimeout);
    mapLoadTimeout = null;
  }
}

function applyPlace(place) {
  if (!place?.geometry?.location) {
    mapStatus.value = "Lokasi belum ditemukan. Coba tulis nama gedung atau alamat yang lebih lengkap.";
    return;
  }

  const address = place.formatted_address || place.name || searchQuery.value;
  marker.setPosition(place.geometry.location);
  googleMap.panTo(place.geometry.location);
  googleMap.setZoom(16);
  updateAddress(address);
  updateMapsUrl(createPlaceUrl(address, place.place_id, place.url));
  mapStatus.value = "";
}

function searchAddress() {
  if (!canUseInteractiveMap.value || !geocoder || !searchQuery.value.trim()) {
    return;
  }

  geocoder.geocode({ address: searchQuery.value }, (results, status) => {
    if (status !== "OK" || !results?.[0]) {
      mapStatus.value = "Alamat belum ditemukan. Coba tambahkan nama kota atau nama gedung.";
      return;
    }

    applyPlace(results[0]);
  });
}

function setLocationFromLatLng(latLng) {
  marker.setPosition(latLng);
  googleMap.panTo(latLng);
  const lat = latLng.lat();
  const lng = latLng.lng();
  updateMapsUrl(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);

  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    if (status === "OK" && results?.[0]?.formatted_address) {
      updateAddress(results[0].formatted_address);
      searchQuery.value = results[0].formatted_address;
      mapStatus.value = "";
      return;
    }

    mapStatus.value = "Pin sudah dipasang. Alamat bisa kamu rapikan manual.";
  });
}

function createPlaceUrl(address, placeId, directUrl) {
  if (placeId) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}&query_place_id=${placeId}`;
  }

  return directUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
</script>

<template>
  <div class="mt-4 space-y-4">
    <label class="block text-sm font-semibold text-ink">
      Cari lokasi di Google Maps
      <div class="mt-2 flex flex-col gap-2 sm:flex-row">
        <div class="relative flex-1">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <input
            ref="searchInput"
            v-model.trim="searchQuery"
            class="focus-ring h-11 w-full rounded-md border border-ink/15 pl-9 pr-3 text-sm"
            placeholder="Cari nama gedung, masjid, hotel, atau alamat"
            :disabled="disabled"
            @keyup.enter.prevent="searchAddress"
          />
        </div>
        <button
          class="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md border border-ink/15 px-4 text-sm font-semibold text-ink hover:border-leaf hover:text-leaf disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          :disabled="disabled || !shouldShowInteractiveMap"
          @click="searchAddress"
        >
          <MapPin class="h-4 w-4" />
          Cari
        </button>
      </div>
    </label>

    <div class="overflow-hidden rounded-md border border-ink/10 bg-linen">
      <div v-if="shouldShowInteractiveMap" ref="mapElement" class="h-72 w-full" />
      <iframe
        v-else
        class="h-72 w-full border-0"
        :src="fallbackMapUrl"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="Pratinjau Google Maps"
      />
    </div>

    <p v-if="mapStatus" class="text-xs font-semibold text-rose">{{ mapStatus }}</p>
    <p v-else-if="shouldShowInteractiveMap" class="text-xs text-ink/50">
      Klik peta atau geser pin untuk menentukan titik lokasi yang paling tepat.
    </p>
    <p v-else class="text-xs text-ink/50">
      Peta interaktif hanya aktif jika API key terbaca dan domain halaman diizinkan.
    </p>

    <label class="block text-sm font-semibold text-ink">
      Alamat
      <textarea
        :value="address"
        class="focus-ring mt-2 min-h-24 w-full rounded-md border px-3 py-2 text-sm"
        :class="addressClass"
        :data-invalid="addressInvalid"
        :disabled="disabled"
        @input="updateAddress($event.target.value.trim())"
      />
    </label>
    <p v-if="addressError" class="text-xs font-semibold text-rose">{{ addressError }}</p>

    <label class="block text-sm font-semibold text-ink">
      Link Google Maps
      <div class="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          :value="googleMapsUrl"
          class="focus-ring h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
          placeholder="Otomatis terisi setelah lokasi dipilih"
          :disabled="disabled"
          @input="updateMapsUrl($event.target.value.trim())"
        />
        <a
          class="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md border border-ink/15 px-4 text-sm font-semibold text-ink hover:border-leaf hover:text-leaf"
          :href="openMapsUrl"
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink class="h-4 w-4" />
          Buka
        </a>
      </div>
    </label>
  </div>
</template>
