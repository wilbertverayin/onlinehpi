export type QuestionKey = 'chiefComplaint' | 'onset' | 'provocationWorsens' | 'provocationImproves' | 'quality' | 'radiation' | 'severity' | 'timing' | 'painLocation' | 'radiationStart' | 'radiationEnd' | 'alcoholIntake' | 'smokingHistory' | 'familyHistory' | 'secondhandSmoke' | 'sexualHistory';

export interface Question {
  key: QuestionKey;
  label: string;
  text: string;
  interactive?: {
    type: 'buttons' | 'scale' | 'calendar_and_buttons' | 'multi-select';
    options?: string[];
  };
}

export const bodyParts = {
  "Head & Neck 🧠": [
    'Head (Ulo)', 'Back of neck (Batok)', 'Forehead (Noo)', 'Ear (Tenga)', 'Jaw (Panga)', 'Neck (Leeg)', 'Throat (Lalamunan)'
  ],
  "Upper Body 👕": [
    'Shoulder (Balikat)', 'Chest (Dibdib)', 'Back (Likod)', 'Abdomen (Tiyan)', 'Lower abdomen (Puson)', 'Flank (Tagiliran)'
  ],
  "Arms & Hands 💪": [
    'Arm (Braso)', 'Elbow (Siko)', 'Hand (Kamay)', 'Fingers (Daliri)'
  ],
  "Legs & Feet 🦵": [
    'Hip (Balakang)', 'Thigh (Hita)', 'Knee (Tuhod)', 'Leg (Binti)', 'Foot (Paa)'
  ],
};


export const questions: Question[] = [
  {
    key: 'chiefComplaint',
    label: 'Chief Complaint',
    text: "Magandang araw! Upang magsimula, ano po ang iyong pangunahing dahilan ng pagkonsulta o chief complaint?",
    interactive: {
      type: 'buttons',
      options: [
        '🤒 Lagnat (Fever)',
        '🤧 Ubo / Sipon (Cough / Colds)',
        '🤕 Sakit ng ulo (Headache)',
        '🧍 Sakit ng katawan (Body pain)',
        '🤢 Sakit ng tiyan (Abdominal pain)',
        '🦷 Sakit ngipin (Toothache)',
        '👁️ Pamumula / Pangangati ng mata (Eye redness / Itchiness)',
        '🚶‍♂️ Sakit sa likod (Back pain)',
        '❤️‍🩹 Sakit sa dibdib (Chest pain)',
        '😮‍💨 Hirap sa paghinga (Shortness of breath)',
        '🚽 Pagtatae (Diarrhea)',
        '🧱 Hindi makadumi (Constipation)',
        '😵 Pagkahilo (Dizziness / Vertigo)',
        '💓 Kabog ng dibdib (Palpitations)',
        '🍓 Pantal / Alerdyi (Skin rashes / Allergy)',
        '💧 Problema sa pag-ihi (Urinary issues)',
        '🩸 Sakit sa puson (Menstrual pain)',
        '😴 Pagkapagod / Panghihina (Fatigue / Weakness)',
      ]
    }
  },
  {
    key: 'onset',
    label: 'Onset',
    text: "Salamat po sa pagbabahagi. Ngayon, kailan po eksaktong nagsimula ang sintomas na ito?",
    interactive: {
      type: 'calendar_and_buttons',
      options: [
        '☀️ Wala pang isang araw (Less than a day ago)',
        '🗓️ 1-3 araw na ang nakalipas (1-3 days ago)',
        '📅 Mga isang linggo na (About a week ago)',
        '📆 Mahigit isang linggo na (More than a week ago)'
      ]
    }
  },
  {
    key: 'provocationWorsens',
    label: 'Provocation (Worsens)',
    text: 'May mga bagay po ba na nakakapagpalala sa nararamdaman mo? (What makes it worse?)',
    interactive: {
      type: 'multi-select',
      options: [
        '🏃 Kapag gumagalaw (With movement)',
        '👉 Pag hinihipo o pinipisil (When touched/pressed)',
        '🚶 Kapag tumatayo o naglalakad (When standing/walking)',
        '🗣️ Kapag umuubo (When coughing)',
        '🍔 Kapag kumakain (When eating)',
        '🛌 Kapag nahihiga (When lying down)',
        '🤯 Kapag nai-stress (With stress)',
        '🥶 Kapag malamig (In cold temperatures)',
        '🤷‍♀️ Wala pong nagpapalala (Nothing makes it worse)',
      ]
    }
  },
  {
    key: 'provocationImproves',
    label: 'Palliation (Improves)',
    text: 'Salamat. Ano naman po ang nakakapagpaginhawa o nakakapagpagaan sa nararamdaman mo? (What makes it better?)',
    interactive: {
      type: 'multi-select',
      options: [
        '🧘 Kapag nagpapahinga (With rest)',
        '💊 Kapag umiinom ng gamot (With medicine)',
        '🔥 Kapag naiinitan (With warmth)',
        '🪑 Kapag nakaupo (When sitting)',
        '💆 Kapag minamasahe (With massage)',
        '♨️ Kapag may hot compress (With hot compress)',
        '🧴 Pag nag-apply ng ointment (With ointment)',
        '😴 Kapag natutulog (When sleeping)',
        "🤷‍♂️ Wala pong nagpapagaan (Nothing makes it better)",
      ]
    }
  },
  {
    key: 'quality',
    label: 'Quality',
    text: 'Okay. Paano niyo po ilalarawan ang klase ng sakit (quality)? Ito po ba ay matulis, parang tinutusok, mainit, o iba pa?',
    interactive: {
        type: 'buttons',
        options: [
          '🔪 Matulis (Sharp)',
          '😩 Kumikirot (Dull ache)',
          '🔥 Mahapdi (Burning)',
          '💓 Tumitibok-tibok (Throbbing)',
          '🗡️ Parang tinutusok (Stabbing)',
          '😖 Parang pinipilipit (Cramping)',
        ]
    }
  },
  {
    key: 'radiation',
    label: 'Radiation',
    text: 'Naiintindihan ko. Ang sakit po ba ay nananatili sa isang lugar o kumakalat (radiation) sa ibang parte ng katawan?',
    interactive: {
        type: 'buttons',
        options: [
            '📍 Nananatili sa isang lugar (Stays in one place)',
            '↔️ Kumakalat (Spreads)',
        ]
    }
  },
  {
    key: 'severity',
    label: 'Severity',
    text: 'Malapit na po tayong matapos. Sa isang scale na 0 hanggang 10, gaano po katindi (severity) ang sakit ngayon?',
    interactive: {
        type: 'scale',
        options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    }
  },
  {
    key: 'timing',
    label: 'Timing',
    text: 'Sige po. Gaano po kadalas ang sakit (timing)? Ito po ba ay tuloy-tuloy, o pabalik-balik lang?',
    interactive: {
        type: 'buttons',
        options: [
            '🔄 Tuloy-tuloy (Constant, always there)',
            '〰️ Pabalik-balik (Comes and goes)',
            '🌅 Mas malala sa umaga (Worse in the morning)',
            '🌃 Mas malala sa gabi (Worse at night)'
        ]
    }
  },
  {
    key: 'alcoholIntake',
    label: 'Alcohol Intake',
    text: 'Umiinom po ba kayo ng alak? Kung oo, gaano kadalas? Maaari niyo pong laktawan ang tanong na ito.',
    interactive: {
      type: 'buttons',
      options: [
        '🍾 Araw-araw o halos araw-araw (Regularly)',
        '🍻 Paminsan-minsan (Occasionally)',
        '🎉 Sa mga okasyon lang (Socially)',
        '🚫 Hindi umiinom (Never)',
        '🤫 Mas-gugustuhing hindi sabihin (Prefer not to say)',
      ]
    }
  },
  {
    key: 'smokingHistory',
    label: 'Smoking History',
    text: 'Kayo po ba ay naninigarilyo, o dati bang naninigarilyo? Maaari niyo pong laktawan ang tanong na ito.',
    interactive: {
      type: 'buttons',
      options: [
        '🚬 Oo, sa kasalukuyan (Yes, currently)',
        '🚭 Dati, pero huminto na (Used to, but stopped)',
        '🌬️ Hindi kailanman (Never)',
        '🤫 Mas-gugustuhing hindi sabihin (Prefer not to say)',
      ]
    }
  },
  {
    key: 'secondhandSmoke',
    label: 'Secondhand Smoke Exposure',
    text: 'Mayroon po bang kasama sa bahay na naninigarilyo? Maaari niyo pong laktawan ang tanong na ito.',
    interactive: {
        type: 'buttons',
        options: [
            '👍 Oo, mayroon (Yes)',
            '👎 Wala (No)',
            '🤫 Mas-gugustuhing hindi sabihin (Prefer not to say)',
        ]
    }
  },
  {
    key: 'familyHistory',
    label: 'Family History',
    text: 'Mayroon po bang miyembro sa inyong pamilya na may malubhang karamdaman na namamana (hereditary), tulad ng high blood, diabetes, cancer, o sakit sa puso? Maaari niyo pong laktawan ang tanong na ito.',
    interactive: {
      type: 'buttons',
      options: [
        '👍 Oo, mayroon (Yes)',
        '👎 Wala (No)',
        '🤔 Hindi ako sigurado (I\'m not sure)',
        '🤫 Mas-gugustuhing hindi sabihin (Prefer not to say)',
      ]
    }
  },
  {
    key: 'sexualHistory',
    label: 'Sexual History',
    text: 'Kailan po ang huling beses na kayo ay nakipagtalik, at ito po ba ay protektado (gumamit ng condom, etc.)? Maaari niyo pong laktawan ang tanong na ito kung hindi komportable.',
    interactive: {
      type: 'buttons',
      options: [
        '🛡️ Protektado, sa loob ng huling buwan (Protected, within the last month)',
        '🛡️ Protektado, mahigit isang buwan na (Protected, more than a month ago)',
        '🚫 Hindi protektado, sa loob ng huling buwan (Unprotected, within the last month)',
        '🚫 Hindi protektado, mahigit isang buwan na (Unprotected, more than a month ago)',
        '⏳ Hindi aktibo sa pakikipagtalik (Not sexually active)',
        '🤫 Mas-gugustuhing hindi sabihin (Prefer not to say)',
      ]
    }
  }
];
