import professionalAkadCouple from "@/assets/demo/professional-akad-couple.jpg";
import professionalAkadDetail from "@/assets/demo/professional-akad-detail.jpg";
import professionalBrideHijab from "@/assets/demo/professional-bride-hijab.jpg";
import professionalGardenCouple from "@/assets/demo/professional-garden-couple.jpg";
import professionalStageCouple from "@/assets/demo/professional-stage-couple.jpg";

export const demoInvitationImages = {
  main: professionalAkadCouple,
  groom: professionalStageCouple,
  bride: professionalBrideHijab,
  loveStoryMeeting: professionalGardenCouple,
  loveStoryProposal: professionalAkadDetail,
  gallery: [
    professionalAkadCouple,
    professionalStageCouple,
    professionalBrideHijab,
    professionalGardenCouple,
    professionalAkadDetail
  ]
};

export const demoThemeThumbnails = {
  "elegant-classic": professionalAkadCouple,
  "modern-minimal": professionalBrideHijab,
  "floral-garden": professionalGardenCouple,
  "islamic-soft": professionalAkadDetail,
  "nusantara-heritage": professionalStageCouple,
  "coastal-dawn": professionalGardenCouple,
  "golden-bloom-stage": professionalStageCouple
};

export const demoThemeThumbnail = demoThemeThumbnails["elegant-classic"];

export const demoInvitation = {
  coupleNames: "Raka & Amara",
  title: "Pernikahan Raka & Amara",
  guestName: "Bapak/Ibu/Saudara/i",
  mainPhotoUrl: demoInvitationImages.main,
  galleryPhotoUrls: demoInvitationImages.gallery,
  groom: {
    fullName: "Raka Pradipta",
    parentsName: "Putra pertama dari Bapak Surya Pradipta dan Ibu Melati Pradipta",
    photoUrl: demoInvitationImages.groom
  },
  bride: {
    fullName: "Amara Kirana",
    parentsName: "Putri kedua dari Bapak Bima Kirana dan Ibu Ratih Kirana",
    photoUrl: demoInvitationImages.bride
  },
  events: [
    {
      type: "Akad",
      date: "2026-10-18T08:00:00.000Z",
      startTime: "08.00",
      endTime: "10.00",
      address: "Masjid Al Ikhlas, Jl. Kenanga No. 12, Jakarta Selatan",
      googleMapsUrl: "https://maps.google.com/?q=Masjid+Al+Ikhlas+Jakarta+Selatan"
    },
    {
      type: "Resepsi",
      date: "2026-10-18T11:00:00.000Z",
      startTime: "11.00",
      endTime: "14.00",
      address: "Gedung Puspa Kirana, Jl. Melati Raya No. 8, Jakarta Selatan",
      googleMapsUrl: "https://maps.google.com/?q=Gedung+Puspa+Kirana+Jakarta+Selatan"
    }
  ],
  envelope: [
    {
      providerName: "BCA",
      accountNumber: "1234567890",
      accountHolder: "Amara Kirana"
    },
    {
      providerName: "DANA",
      accountNumber: "081234567890",
      accountHolder: "Raka Pradipta"
    }
  ],
  loveStory: [
    {
      title: "Pertama bertemu",
      date: "2021-06-12",
      description: "Raka dan Amara pertama kali bertemu dalam acara komunitas kampus. Obrolan singkat hari itu berubah menjadi percakapan panjang yang terus berlanjut.",
      photoUrl: demoInvitationImages.loveStoryMeeting
    },
    {
      title: "Lamaran keluarga",
      date: "2025-12-20",
      description: "Dua keluarga bertemu dalam suasana hangat untuk merestui langkah Raka dan Amara menuju hari pernikahan.",
      photoUrl: demoInvitationImages.loveStoryProposal
    }
  ],
  dressCode: {
    enabled: true,
    note: "Kami akan senang jika tamu berkenan memakai warna pastel, sage, atau earth tone.",
    colors: ["#f5d7c4", "#d8bfa3", "#8f9f7a", "#6f8f82", "#fff4e8"]
  },
  quote: {
    enabled: true,
    text: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan-pasangan dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
    source: "QS. Ar-Rum: 21"
  },
  creator: {
    displayName: "Janji Nikah Partner",
    memberName: "Rio Undangan",
    businessName: "Rio Undangan Digital",
    username: "rio-undangan"
  },
  wishes: [
    {
      name: "Dian",
      status: "Hadir",
      message: "Semoga menjadi keluarga yang sakinah, mawaddah, warahmah."
    },
    {
      name: "Nadia",
      status: "Hadir",
      message: "Selamat menempuh hidup baru. Bahagia selalu untuk Raka dan Amara."
    },
    {
      name: "Fajar",
      status: "Tidak Hadir",
      message: "Maaf belum bisa hadir. Doa terbaik dari jauh untuk kalian berdua."
    }
  ]
};
