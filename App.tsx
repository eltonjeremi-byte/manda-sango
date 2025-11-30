import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, 
  Zap, 
  BookOpen, 
  Trophy, 
  Swords, 
  ChevronLeft, 
  Check, 
  X,
  Volume2,
  Globe,
  Home,
  AlertTriangle,
  ShoppingBag,
  Users,
  Calendar,
  Activity
} from 'lucide-react';

// --- Types ---

type Language = 'fr' | 'ru';

interface Word {
  id: string;
  sango: string;
  fr: string; // French
  ru: string; // Russian (Placeholder/Approximation for new words)
}

interface Category {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string; // Tailwind class
  borderColor: string; // Tailwind class
  words: Word[];
}

type Screen = 'home' | 'flashcards' | 'quiz' | 'duel';

interface UserState {
  hearts: number;
  xp: number;
  streak: number;
  completedCategories: string[];
}

// --- Data Source (Integrated from PDF) ---

const VOCABULARY: Category[] = [
  {
    id: 'salutations',
    title: 'Salutations & Phrases',
    icon: '👋',
    color: 'bg-blue-600',
    borderColor: 'border-blue-800',
    words: [
      { id: 's1', fr: 'Enchanté', sango: 'Na ngia', ru: 'Приятно познакомиться' },
      { id: 's2', fr: 'Très heureux', sango: 'Be ti mbi anzere', ru: 'Очень рад' },
      { id: 's3', fr: 'Tous mes vœux', sango: 'Ngia mingi', ru: 'С наилучшими пожеланиями' },
      { id: 's4', fr: 'Meilleurs vœux', sango: 'A nzoni yé ti mbi kue', ru: 'Всего хорошего' },
      { id: 's5', fr: 'Bonne chance', sango: 'Nzoni lango na mo', ru: 'Удачи' },
      { id: 's6', fr: 'À bientôt', sango: 'E yeke ba tere', ru: 'До скорого' },
      { id: 's7', fr: 'Pas de problème', sango: 'Ye oko pepe', ru: 'Без проблем' },
      { id: 's8', fr: "C'est gentil", sango: 'So ayeke nzoni', ru: 'Это мило' },
      { id: 's9', fr: 'Je suis désolé', sango: 'Mbi gbu gere ti mo', ru: 'Мне жаль' },
      { id: 's10', fr: 'Pardonnez-moi', sango: 'Gbu guéré', ru: 'Простите меня' },
      { id: 's11', fr: 'Permettez-moi', sango: 'Zia lege na mbi', ru: 'Позвольте мне' }
    ]
  },
  {
    id: 'questions',
    title: 'Questions Courantes',
    icon: '❓',
    color: 'bg-yellow-400',
    borderColor: 'border-yellow-600',
    words: [
      { id: 'q0', fr: 'Parles-tu sango ?', sango: 'Mo tene Sango?', ru: 'Ты говоришь на санго?' },
      { id: 'q1', fr: 'Sérieusement ?', sango: 'A yeke tâ tënë?', ru: 'Серьезно?' },
      { id: 'q2', fr: 'Tu plaisantes ?', sango: 'Mo yeke sara ngia?', ru: 'Ты шутишь?' },
      { id: 'q3', fr: 'Quel est le prix ?', sango: 'Ngere ni ayeke so wa?', ru: 'Какова цена?' },
      { id: 'q4', fr: 'Ça coûte combien ?', sango: 'A yeke futa nginza oke?', ru: 'Сколько это стоит?' },
      { id: 'q5', fr: "Pouvez-vous m'aider ?", sango: 'Mo lingbi ti mû maboko na mbi?', ru: 'Вы можете мне помочь?' },
      { id: 'q6', fr: 'Savez-vous ?', sango: 'Mo hinga ni?', ru: 'Вы знаете?' },
      { id: 'q7', fr: 'Connaissez-vous ?', sango: 'Mo hinga ni nzoni?', ru: 'Вы знакомы?' },
      { id: 'q8', fr: 'Avez-vous ?', sango: 'Mo yeke na ni awe?', ru: 'У вас есть?' },
      { id: 'q9', fr: 'Voulez-vous ?', sango: 'Mo ye ti sara ni?', ru: 'Вы хотите?' },
      { id: 'q10', fr: 'Pouvez-vous ?', sango: 'Mo lingbi ti sara ni?', ru: 'Вы можете?' },
      { id: 'q11', fr: 'Quelle heure est-il ?', sango: 'A yeke ngbonga oke?', ru: 'Который час?' },
      { id: 'q12', fr: 'Quel jour ?', sango: 'Lango wa?', ru: 'Какой день?' },
      { id: 'q13', fr: 'Quelle date ?', sango: 'Date wa?', ru: 'Какая дата?' },
      { id: 'q14', fr: 'Possédez-vous ?', sango: 'Mo yeke na ni?', ru: 'Вы обладаете?' }
    ]
  },
  {
    id: 'people',
    title: 'Gens & Identité',
    icon: <Users size={24} />,
    color: 'bg-blue-700',
    borderColor: 'border-blue-900',
    words: [
      { id: 'p1', fr: 'Enfant', sango: 'Môlengê', ru: 'Ребенок' },
      { id: 'p2', fr: 'Petit enfant', sango: 'Kete molenge', ru: 'Маленький ребенок' },
      { id: 'p3', fr: 'Profession / Métier', sango: 'Kua ti zo', ru: 'Профессия' },
      { id: 'p4', fr: 'Travail', sango: 'Kua', ru: 'Работа' },
      { id: 'p5', fr: 'Nationalité', sango: 'Dutingo molenge ti kodoro', ru: 'Национальность' },
      { id: 'p6', fr: 'Origine', sango: 'Tongondani', ru: 'Происхождение' },
      { id: 'p7', fr: 'Âge', sango: 'Ngu', ru: 'Возраст' },
      { id: 'p8', fr: 'Quel âge as-tu ?', sango: 'Ngu ti mo ayeke oke?', ru: 'Сколько тебе лет?' },
      { id: 'p9', fr: "J'ai... ans", sango: 'Mbi yeke na... ngu', ru: 'Мне ... лет' },
      { id: 'p10', fr: 'Adresse', sango: 'Adresi', ru: 'Адрес' },
      { id: 'p11', fr: 'Famille', sango: 'Sewa', ru: 'Семья' },
      { id: 'p12', fr: 'Marié', sango: 'Lo fa séléka awe', ru: 'Женат/Замужем' },
      { id: 'p13', fr: 'Célibataire', sango: 'Oko', ru: 'Холост' },
      { id: 'p14', fr: 'Habitant', sango: 'Zo ti kodoro', ru: 'Житель' },
      { id: 'p15', fr: 'Étranger', sango: 'Zo ti kodoro ndé', ru: 'Иностранец' },
      { id: 'fam1', fr: 'Grand-père', sango: 'Ata koli', ru: 'Дедушка' },
      { id: 'fam2', fr: 'Grand-mère', sango: 'Ata wali', ru: 'Бабушка' },
      { id: 'fam3', fr: 'Oncle', sango: 'Koya', ru: 'Дядя' },
      { id: 'fam4', fr: 'Tante', sango: 'Homba', ru: 'Тетя' },
      { id: 'fam5', fr: 'Garçon', sango: 'Kete moleng koli', ru: 'Мальчик' },
      { id: 'fam6', fr: 'Fille', sango: 'Kete molenge wali', ru: 'Девочка' }
    ]
  },
  {
    id: 'numbers',
    title: 'Nombres (Bale)',
    icon: '🔢',
    color: 'bg-green-600',
    borderColor: 'border-green-800',
    words: [
      { id: 'n10', fr: 'Dix', sango: 'Bale ôko', ru: 'Десять' },
      { id: 'n11', fr: 'Onze', sango: 'Bale oko na oko', ru: 'Одиннадцать' },
      { id: 'n12', fr: 'Douze', sango: 'Bale oko na use', ru: 'Двенадцать' },
      { id: 'n13', fr: 'Treize', sango: 'Bale oko na ota', ru: 'Тринадцать' },
      { id: 'n14', fr: 'Quatorze', sango: 'Bale oko na osio', ru: 'Четырнадцать' },
      { id: 'n15', fr: 'Quinze', sango: 'Bale oko na oku', ru: 'Пятнадцать' },
      { id: 'n16', fr: 'Seize', sango: 'Bale oko na omene', ru: 'Шестнадцать' },
      { id: 'n20', fr: 'Vingt', sango: 'Bale use', ru: 'Двадцать' },
      { id: 'n30', fr: 'Trente', sango: 'Bale ota', ru: 'Тридцать' },
      { id: 'n40', fr: 'Quarante', sango: 'Bale osio', ru: 'Сорок' },
      { id: 'n50', fr: 'Cinquante', sango: 'Bale oku', ru: 'Пятьдесят' },
      { id: 'n60', fr: 'Soixante', sango: 'Bale omene', ru: 'Шестьдесят' }
    ]
  },
  {
    id: 'time',
    title: 'Temps & Dates',
    icon: <Calendar size={24} />,
    color: 'bg-white',
    borderColor: 'border-slate-300',
    words: [
      { id: 'd1', fr: 'Lundi', sango: 'Bikoua-oko', ru: 'Понедельник' },
      { id: 'd2', fr: 'Mardi', sango: 'Bikou-use', ru: 'Вторник' },
      { id: 'd3', fr: 'Mercredi', sango: 'Bikoua-ota', ru: 'Среда' },
      { id: 'd4', fr: 'Jeudi', sango: 'Bikoua-osio', ru: 'Четверг' },
      { id: 'd5', fr: 'Vendredi', sango: 'Bikoua-oku', ru: 'Пятница' },
      { id: 'd6', fr: 'Samedi', sango: 'Laposo', ru: 'Суббота' },
      { id: 'd7', fr: 'Dimanche', sango: 'Layenda', ru: 'Воскресенье' },
      { id: 'm1', fr: 'Janvier', sango: 'Nze ti Gnyenye', ru: 'Январь' },
      { id: 'm2', fr: 'Février', sango: 'Nze ti folondigui', ru: 'Февраль' },
      { id: 'm3', fr: 'Mars', sango: 'Nze ti mbango', ru: 'Март' },
      { id: 'm4', fr: 'Avril', sango: 'Ngu ti', ru: 'Апрель' },
      { id: 'm5', fr: 'Mai', sango: 'Mbi pe ti', ru: 'Май' },
      { id: 'm6', fr: 'Juin', sango: 'Nze ti', ru: 'Июнь' },
      { id: 'm12', fr: 'Décembre', sango: 'Nze ti kakaouka', ru: 'Декабрь' },
      { id: 't_saison', fr: 'Saison', sango: 'Ngoi', ru: 'Сезон' },
      { id: 't_heure', fr: 'Heure', sango: 'Ngbonga', ru: 'Час/Время' }
    ]
  },
  {
    id: 'market',
    title: 'Au Marché',
    icon: <ShoppingBag size={24} />,
    color: 'bg-yellow-500',
    borderColor: 'border-yellow-700',
    words: [
      { id: 'mk1', fr: 'Bon marché', sango: 'Ngêrë nî kete', ru: 'Дешево' },
      { id: 'mk2', fr: 'Vendeur', sango: 'Zo ti kango ye', ru: 'Продавец' },
      { id: 'mk3', fr: 'Acheteur', sango: 'Zo ti vongo ye', ru: 'Покупатель' },
      { id: 'mk4', fr: 'Pièce', sango: 'Mosoro ti wen', ru: 'Монета' },
      { id: 'mk5', fr: 'Billet', sango: 'Ngere ti nginza', ru: 'Банкнота' },
      { id: 'mk6', fr: 'Reçu', sango: 'Yamba', ru: 'Чек/Квитанция' },
      { id: 'mk7', fr: 'Facture', sango: 'Mbeti ti nginza', ru: 'Счет' },
      { id: 'mk8', fr: 'Remise', sango: 'Kete ngere', ru: 'Скидка' },
      { id: 'mk9', fr: 'Boutique', sango: 'Da buze', ru: 'Магазин' },
      { id: 'mk10', fr: 'Négocier', sango: 'Lisolo ti kango ye', ru: 'Торговаться' },
      { id: 'mk11', fr: 'Payer', sango: 'Futa', ru: 'Платить' }
    ]
  },
  {
    id: 'food',
    title: 'Nourriture & Boisson',
    icon: '☕',
    color: 'bg-green-500',
    borderColor: 'border-green-700',
    words: [
      { id: 'fd1', fr: 'Bon appétit', sango: 'Kobe anzere na yanga ti mo', ru: 'Приятного аппетита' },
      { id: 'fd2', fr: 'Lait', sango: 'Dule', ru: 'Молоко' },
      { id: 'fd3', fr: 'Fromage', sango: 'Fromage', ru: 'Сыр' },
      { id: 'fd4', fr: 'Beurre', sango: 'Dubere', ru: 'Масло' },
      { id: 'fd5', fr: 'Huile', sango: 'Mafuta', ru: 'Растительное масло' },
      { id: 'fd6', fr: 'Sel', sango: 'Ingo', ru: 'Соль' },
      { id: 'fd7', fr: 'Sucre', sango: 'Sukani', ru: 'Сахар' },
      { id: 'fd8', fr: 'Café', sango: 'Kawa', ru: 'Кофе' },
      { id: 'fd9', fr: 'Thé', sango: 'Chaille', ru: 'Чай' },
      { id: 'fd10', fr: 'Bière', sango: 'Samba', ru: 'Пиво' }
    ]
  },
  {
    id: 'verbs',
    title: 'Verbes Courants',
    icon: <Activity size={24} />,
    color: 'bg-red-500',
    borderColor: 'border-red-700',
    words: [
      { id: 'v1', fr: 'Aimer', sango: 'Yê', ru: 'Любить' },
      { id: 'v2', fr: 'Courir', sango: 'Loro', ru: 'Бежать' },
      { id: 'v3', fr: 'Marcher', sango: 'Tambela', ru: 'Идти' },
      { id: 'v4', fr: 'Danser', sango: 'Dodo', ru: 'Танцевать' },
      { id: 'v5', fr: 'Chanter', sango: 'He bia', ru: 'Петь' },
      { id: 'v6', fr: 'Rire', sango: 'Ngia', ru: 'Смеяться' },
      { id: 'v7', fr: 'Pleurer', sango: 'Toto', ru: 'Плакать' },
      { id: 'v8', fr: 'Crier', sango: 'Dekongo', ru: 'Кричать' },
      { id: 'v9', fr: 'Écouter', sango: 'Ma', ru: 'Слушать' },
      { id: 'v10', fr: 'Parler', sango: 'Tene', ru: 'Говорить' },
      { id: 'v11', fr: 'Lire', sango: 'Diko', ru: 'Читать' },
      { id: 'v12', fr: 'Donner', sango: 'Mu', ru: 'Давать' }
    ]
  },
  {
    id: 'adjectives',
    title: 'Adjectifs',
    icon: '✨',
    color: 'bg-blue-500',
    borderColor: 'border-blue-700',
    words: [
      { id: 'adj1', fr: 'Rapide', sango: 'Hio', ru: 'Быстрый' },
      { id: 'adj2', fr: 'Lent', sango: 'Yeke', ru: 'Медленный' },
      { id: 'adj3', fr: 'Fort', sango: 'Ngangu', ru: 'Сильный' },
      { id: 'adj4', fr: 'Faible', sango: 'Awoko', ru: 'Слабый' },
      { id: 'adj5', fr: 'En Haut', sango: 'NA NDUZU', ru: 'Вверху' },
      { id: 'adj6', fr: 'Bas', sango: 'Na sese', ru: 'Внизу' },
      { id: 'adj7', fr: 'Nouveau', sango: 'Fini', ru: 'Новый' },
      { id: 'adj8', fr: 'Vieux', sango: 'Mbakoro', ru: 'Старый' },
      { id: 'adj9', fr: 'Jeune', sango: 'Maseka', ru: 'Молодой' },
      { id: 'adj10', fr: 'Facile', sango: 'Ngbere', ru: 'Легкий' },
      { id: 'adj11', fr: 'Difficile', sango: 'Kpale', ru: 'Трудный' }
    ]
  },
  {
    id: 'pronouns',
    title: 'Pronoms',
    icon: '👉',
    color: 'bg-white',
    borderColor: 'border-slate-300',
    words: [
      { id: 'pr1', fr: 'Notre / Nos', sango: 'Ti e', ru: 'Наш' },
      { id: 'pr2', fr: 'Votre / Vos', sango: 'Ti mo', ru: 'Ваш' },
      { id: 'pr3', fr: 'Leur / Leurs', sango: 'Ala', ru: 'Их' },
      { id: 'pr4', fr: 'Ce / Cet / Cette', sango: 'Ye so', ru: 'Этот' },
      { id: 'pr5', fr: 'Tous', sango: 'Kwe', ru: 'Все' },
      { id: 'pr6', fr: 'Chacun', sango: 'Oko oko', ru: 'Каждый' },
      { id: 'pr7', fr: 'Personne', sango: 'Zo oko pepe', ru: 'Никто' },
      { id: 'pr8', fr: 'Rien', sango: 'Ye oko pepe', ru: 'Ничто' },
      { id: 'pr9', fr: 'Le mien', sango: 'Ti mbi', ru: 'Мой' },
      { id: 'pr10', fr: 'Le sien', sango: 'Ti Lo', ru: 'Его' }
    ]
  },
  {
    id: 'emergency',
    title: 'Urgences',
    icon: <AlertTriangle size={24} />,
    color: 'bg-red-600',
    borderColor: 'border-red-800',
    words: [
      { id: 'em1', fr: 'Je suis malade', sango: 'Mbi yeke na kobela', ru: 'Я болен' },
      { id: 'em2', fr: 'Danger !', sango: 'Kpale!', ru: 'Опасность!' },
      { id: 'em3', fr: "Appelle l'ambulance", sango: 'Iri mbeni ambulance!', ru: 'Вызови скорую' },
      { id: 'em4', fr: 'Je suis blessé', sango: 'Mbi wara kä', ru: 'Я ранен' },
      { id: 'em5', fr: 'Hôpital', sango: 'Danganga', ru: 'Больница' },
      { id: 'em6', fr: 'Police', sango: 'Turugu', ru: 'Полиция' },
      { id: 'em7', fr: 'Accident', sango: 'Ye ti ngangu', ru: 'Авария' },
      { id: 'em8', fr: 'Incendie', sango: 'Wa', ru: 'Пожар' },
      { id: 'em9', fr: 'Vol', sango: 'Nzi', ru: 'Кража' },
      { id: 'em10', fr: 'Je ne comprends pas', sango: 'Mbi ma nzoni ape!', ru: 'Я не понимаю' },
      { id: 'em11', fr: 'Parlez lentement', sango: 'Sara tënë yeke yeke', ru: 'Говорите медленно' }
    ]
  }
];

// --- Components ---

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false 
}: { 
  children?: React.ReactNode; 
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; 
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'yellow'; 
  className?: string;
  disabled?: boolean;
}) => {
  const baseStyle = "font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center uppercase tracking-wide disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed";
  
  // Updated colors to match CAR flag theme
  const variants = {
    primary: "bg-green-600 hover:bg-green-500 text-white border-b-4 border-green-800 active:border-b-0 active:translate-y-1", // Forest Green
    secondary: "bg-blue-700 hover:bg-blue-600 text-white border-b-4 border-blue-900 active:border-b-0 active:translate-y-1", // Deep Blue
    danger: "bg-red-600 hover:bg-red-500 text-white border-b-4 border-red-800 active:border-b-0 active:translate-y-1", // Flag Red
    yellow: "bg-yellow-400 hover:bg-yellow-300 text-slate-900 border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1", // Flag Yellow
    outline: "bg-white hover:bg-gray-50 text-slate-700 border-2 border-slate-200 border-b-4 hover:border-slate-300 active:border-b-2 active:translate-y-0.5",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-500 border-none"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// CAR Flag Component
const CARFlag = ({ className = "" }: { className?: string }) => (
  <div className={`flex flex-col h-8 w-12 rounded overflow-hidden shadow-sm border border-slate-100 ${className}`}>
    <div className="flex flex-1">
       <div className="w-1/4 bg-blue-700 h-full relative">
         <div className="absolute top-0.5 left-1 text-yellow-400 text-[8px]">★</div>
       </div>
       <div className="w-1/4 bg-white h-full"></div>
       <div className="w-1/4 bg-green-600 h-full"></div>
       <div className="w-1/4 bg-yellow-400 h-full"></div>
    </div>
    <div className="h-[25%] bg-red-600 w-full z-10 absolute top-1/2 left-0 -translate-y-1/2 opacity-90 mix-blend-multiply hidden"></div> 
    {/* Simplified Vertical bar for CAR flag representation in small scale */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/5 h-full bg-red-600"></div>
  </div>
);

const Header = ({ 
  userState, 
  currentLang, 
  setLang,
  goHome 
}: { 
  userState: UserState, 
  currentLang: Language, 
  setLang: (l: Language) => void,
  goHome: () => void
}) => {
  return (
    <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="flex gap-3 items-center">
        <button onClick={goHome} className="text-slate-400 hover:text-slate-600 transition-colors">
          <Home size={28} />
        </button>
        <CARFlag />
        <button 
          onClick={() => setLang(currentLang === 'fr' ? 'ru' : 'fr')}
          className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 border-b-2 border-slate-300 active:border-b-0 active:translate-y-0.5 ml-2"
        >
          <Globe size={18} className="text-slate-500" />
          <span className="font-bold text-slate-600 uppercase">{currentLang === 'fr' ? 'FR' : 'RU'}</span>
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Zap className="text-yellow-400 fill-current" size={24} />
          <span className="font-bold text-yellow-500 text-lg">{userState.xp}</span>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="text-red-600 fill-current" size={24} />
          <span className="font-bold text-red-600 text-lg">{userState.hearts}</span>
        </div>
      </div>
    </div>
  );
};

// --- App Component ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [currentLang, setCurrentLang] = useState<Language>('fr');
  
  // Quiz/Flashcard State
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'wrong' | null>(null);
  const [duelCode, setDuelCode] = useState<string>('');
  
  const [userState, setUserState] = useState<UserState>({
    hearts: 5,
    xp: 120,
    streak: 3,
    completedCategories: []
  });

  const activeWords = useMemo(() => activeCategory?.words || [], [activeCategory]);

  const handleStartActivity = (category: Category, activity: 'flashcards' | 'quiz') => {
    setActiveCategory(category);
    setCardIndex(0);
    setIsFlipped(false);
    setSelectedAnswer(null);
    setAnswerStatus(null);
    setScreen(activity);
    
    if (activity === 'quiz') {
      prepareQuizQuestion(category, 0);
    }
  };

  const prepareQuizQuestion = (category: Category, index: number) => {
    const correctWord = category.words[index];
    const targetLang = currentLang === 'fr' ? 'fr' : 'ru';
    
    // HARD MODE LOGIC:
    // 1. Get words from the SAME category first (Distractors that are semantically related)
    let distractors = category.words
      .filter(w => w.id !== correctWord.id)
      .map(w => w[targetLang]);
      
    // Shuffle same-category distractors
    distractors = distractors.sort(() => 0.5 - Math.random());

    // 2. If we don't have enough (need 3), take from other categories
    if (distractors.length < 3) {
      const otherWords = VOCABULARY.flatMap(c => c.words)
        .filter(w => w.id !== correctWord.id && !category.words.find(cw => cw.id === w.id))
        .map(w => w[targetLang])
        .sort(() => 0.5 - Math.random());
      
      distractors = [...distractors, ...otherWords];
    }

    // Slice to get 3 distractors
    const finalDistractors = distractors.slice(0, 3);
    
    const options = [correctWord[targetLang], ...finalDistractors]
      .sort(() => 0.5 - Math.random());
      
    setQuizOptions(options);
  };

  const handleQuizAnswer = (answer: string) => {
    if (selectedAnswer || !activeCategory) return;
    
    setSelectedAnswer(answer);
    const correctWord = activeCategory.words[cardIndex];
    const correctAnswerText = currentLang === 'fr' ? correctWord.fr : correctWord.ru;

    if (answer === correctAnswerText) {
      setAnswerStatus('correct');
      // Play sound effect placeholder
      setUserState(prev => ({ ...prev, xp: prev.xp + 10 }));
    } else {
      setAnswerStatus('wrong');
      setUserState(prev => ({ ...prev, hearts: Math.max(0, prev.hearts - 1) }));
    }
  };

  const nextQuizQuestion = () => {
    if (!activeCategory) return;

    if (cardIndex < activeCategory.words.length - 1) {
      const nextIndex = cardIndex + 1;
      setCardIndex(nextIndex);
      setSelectedAnswer(null);
      setAnswerStatus(null);
      prepareQuizQuestion(activeCategory, nextIndex);
    } else {
      // Finished logic
      setUserState(prev => ({
        ...prev,
        completedCategories: [...prev.completedCategories, activeCategory.id]
      }));
      setScreen('home');
    }
  };

  // --- Render Screens ---

  const renderHomeScreen = () => (
    <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto">
      <div className="mb-8 text-center bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Mada Sango</h1>
        <p className="text-slate-500 font-medium">
          Apprenez la langue de la République Centrafricaine
        </p>
        <div className="flex justify-center gap-2 mt-4">
           <div className="h-2 w-8 bg-blue-700 rounded-full"></div>
           <div className="h-2 w-8 bg-white border border-slate-200 rounded-full"></div>
           <div className="h-2 w-8 bg-green-600 rounded-full"></div>
           <div className="h-2 w-8 bg-yellow-400 rounded-full"></div>
           <div className="h-2 w-8 bg-red-600 rounded-full"></div>
        </div>
      </div>

      <div className="grid gap-6">
        {VOCABULARY.map((category, index) => (
          <div key={category.id} className="relative group">
            {/* Connector Line */}
            {index < VOCABULARY.length - 1 && (
              <div className="absolute left-1/2 -bottom-6 w-1 h-6 bg-slate-200 -translate-x-1/2 -z-10" />
            )}
            
            <div 
              className={`
                bg-white border-2 rounded-3xl p-4 shadow-sm hover:border-blue-300 transition-all cursor-pointer
                ${category.borderColor}
                ${userState.completedCategories.includes(category.id) ? 'bg-yellow-50 border-yellow-400' : ''}
              `}
              onClick={() => handleStartActivity(category, 'quiz')}
            >
              <div className={`w-16 h-16 rounded-2xl ${category.color} flex items-center justify-center text-3xl shadow-lg mb-3 mx-auto transform group-hover:scale-110 transition-transform text-white`}>
                {category.icon}
              </div>
              <h3 className="text-center font-bold text-slate-700 text-lg">{category.title}</h3>
              <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{category.words.length} Mots</p>
              
              <div className="flex gap-2 mt-4 justify-center">
                <Button 
                  variant="outline" 
                  className="py-2 px-4 text-sm w-full"
                  onClick={(e) => { e.stopPropagation(); handleStartActivity(category, 'flashcards'); }}
                >
                  <BookOpen size={16} className="mr-2" />
                  Étudier
                </Button>
                <Button 
                  variant="primary" 
                  className="py-2 px-4 text-sm w-full"
                  onClick={(e) => { e.stopPropagation(); handleStartActivity(category, 'quiz'); }}
                >
                  <Trophy size={16} className="mr-2" />
                  Quiz
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-blue-900 rounded-3xl text-white text-center relative overflow-hidden border-b-8 border-blue-950">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10">
          <Swords size={48} className="mx-auto mb-4 text-yellow-400" />
          <h2 className="text-2xl font-bold mb-2">Mode Duel</h2>
          <p className="mb-6 opacity-80">Défiez vos amis dans un combat de vocabulaire !</p>
          <Button variant="yellow" className="w-full text-blue-900" onClick={() => setScreen('duel')}>
            Commencer le Duel
          </Button>
        </div>
      </div>
    </div>
  );

  const renderFlashcards = () => {
    if (!activeCategory) return null;
    const word = activeWords[cardIndex];

    return (
      <div className="flex flex-col h-[calc(100vh-80px)] max-w-lg mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => setScreen('home')}><X /></Button>
          <div className="h-4 w-full bg-slate-200 rounded-full mx-4 overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${((cardIndex + 1) / activeWords.length) * 100}%` }}
            />
          </div>
          <span className="font-bold text-slate-400">{cardIndex + 1}/{activeWords.length}</span>
        </div>

        <div className="flex-1 perspective-1000 mb-8 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
          <div className={`relative w-full h-full duration-500 transform-style-3d transition-all ${isFlipped ? 'rotate-y-180' : ''}`}>
            {/* Front */}
            <div className="absolute inset-0 w-full h-full bg-white border-2 border-slate-200 border-b-[6px] rounded-3xl flex flex-col items-center justify-center p-8 backface-hidden shadow-lg">
               <span className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-6">Sango</span>
               <h2 className="text-3xl md:text-5xl font-extrabold text-slate-700 text-center break-words w-full">{word.sango}</h2>
               <div className="mt-8 p-3 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors">
                  <Volume2 size={32} />
               </div>
               <p className="absolute bottom-6 text-slate-400 text-sm animate-pulse">Appuyez pour retourner</p>
            </div>

            {/* Back */}
            <div className="absolute inset-0 w-full h-full bg-blue-600 border-2 border-blue-700 border-b-[6px] rounded-3xl flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180 shadow-lg text-white">
               <span className="text-blue-200 font-bold uppercase tracking-widest text-sm mb-6">
                 {currentLang === 'fr' ? 'Français' : 'Русский'}
               </span>
               <h2 className="text-2xl md:text-4xl font-extrabold text-center break-words w-full">
                 {currentLang === 'fr' ? word.fr : word.ru}
               </h2>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="flex-1 py-4 text-lg"
            onClick={() => {
              if (cardIndex > 0) {
                setCardIndex(cardIndex - 1);
                setIsFlipped(false);
              }
            }}
            disabled={cardIndex === 0}
          >
            <ChevronLeft className="mr-2" /> Précédent
          </Button>
          <Button 
            variant="primary" 
            className="flex-1 py-4 text-lg"
            onClick={() => {
              if (cardIndex < activeWords.length - 1) {
                setCardIndex(cardIndex + 1);
                setIsFlipped(false);
              } else {
                setScreen('home');
              }
            }}
          >
            {cardIndex === activeWords.length - 1 ? 'Terminer' : 'Suivant'}
          </Button>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    if (!activeCategory) return null;
    const word = activeWords[cardIndex];

    return (
      <div className="flex flex-col h-[calc(100vh-80px)] max-w-lg mx-auto p-4">
         <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => setScreen('home')}><X /></Button>
          <div className="h-4 w-full bg-slate-200 rounded-full mx-4 overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${((cardIndex) / activeWords.length) * 100}%` }}
            />
          </div>
           <div className="flex items-center text-red-600 font-bold">
             <Heart className="fill-current mr-1" size={20} /> {userState.hearts}
           </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-slate-700 mb-8 text-center">
            Traduisez cette phrase
          </h2>
          
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-4 w-full max-w-md">
               <div className="w-24 h-24 bg-blue-600 rounded-2xl flex-shrink-0 flex items-center justify-center text-4xl shadow-md text-white border-b-4 border-blue-800">
                 🗣️
               </div>
               <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm relative flex-grow">
                 <p className="text-xl font-bold text-slate-700">{word.sango}</p>
                 <div className="absolute -left-2 -top-2 w-0 h-0 border-t-[10px] border-t-transparent border-r-[10px] border-r-slate-200 border-b-[10px] border-b-transparent transform rotate-45"></div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {quizOptions.map((option, idx) => {
              let btnVariant: 'outline' | 'primary' | 'danger' = 'outline';
              if (selectedAnswer === option) {
                btnVariant = answerStatus === 'correct' ? 'primary' : 'danger';
              }
              
              return (
                <Button 
                  key={idx}
                  variant={btnVariant}
                  className={`py-4 text-lg normal-case justify-start px-6 ${selectedAnswer && selectedAnswer !== option ? 'opacity-50' : ''}`}
                  onClick={() => handleQuizAnswer(option)}
                  disabled={!!selectedAnswer}
                >
                  {option}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Bottom Sheet Feedback */}
        {selectedAnswer && (
          <div className={`
            fixed bottom-0 left-0 w-full p-6 animate-in slide-in-from-bottom duration-300 border-t-2
            ${answerStatus === 'correct' ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'}
          `}>
             <div className="max-w-lg mx-auto flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${answerStatus === 'correct' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                    {answerStatus === 'correct' ? <Check size={24} /> : <X size={24} />}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xl font-bold ${answerStatus === 'correct' ? 'text-green-800' : 'text-red-800'}`}>
                      {answerStatus === 'correct' ? 'Excellent !' : 'Oups !'}
                    </span>
                    {answerStatus !== 'correct' && (
                      <span className="text-red-600">Réponse : {currentLang === 'fr' ? word.fr : word.ru}</span>
                    )}
                  </div>
                </div>
                <Button 
                  variant={answerStatus === 'correct' ? 'primary' : 'danger'} 
                  className="w-full py-4 text-lg"
                  onClick={nextQuizQuestion}
                >
                  Continuer
                </Button>
             </div>
          </div>
        )}
      </div>
    );
  };

  const renderDuel = () => {
    return (
      <div className="flex flex-col h-screen bg-blue-950 text-white p-6 items-center justify-center relative overflow-hidden">
        {/* Decorative elements for Duel Mode */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-red-600 rounded-full blur-3xl opacity-20"></div>

        <Button variant="ghost" className="absolute top-4 left-4 text-white hover:bg-white/10 z-20" onClick={() => setScreen('home')}>
          <ChevronLeft /> Retour
        </Button>
        
        <div className="relative z-10 flex flex-col items-center">
          <Swords size={80} className="text-yellow-400 mb-6 animate-bounce-sm drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          <h1 className="text-5xl font-extrabold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
            MODE DUEL
          </h1>
          <p className="text-blue-200 mb-12 text-center max-w-xs font-medium">
            Générez un code et affrontez un ami sur le vocabulaire Sango !
          </p>

          {duelCode ? (
             <div className="w-full max-w-sm bg-blue-900 p-8 rounded-3xl border-2 border-blue-800 text-center animate-in zoom-in duration-300 shadow-2xl">
               <p className="text-sm font-bold text-blue-300 uppercase mb-2 tracking-widest">Code de Combat</p>
               <h2 className="text-5xl font-mono font-bold text-white tracking-widest mb-8">{duelCode}</h2>
               <div className="space-y-4">
                 <Button variant="primary" className="w-full py-4 text-lg" onClick={() => setScreen('quiz')}>
                   Lancer le défi
                 </Button>
                 <Button variant="ghost" className="w-full text-blue-300 hover:text-white" onClick={() => setDuelCode('')}>
                   Annuler
                 </Button>
               </div>
             </div>
          ) : (
            <div className="w-full max-w-sm space-y-4">
               <Button 
                 variant="primary" 
                 className="w-full py-4 text-lg shadow-lg shadow-green-900/50"
                 onClick={() => setDuelCode(Math.random().toString(36).substring(2, 7).toUpperCase())}
               >
                 Créer une Salle
               </Button>
               <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-blue-800"></div>
                  <span className="flex-shrink mx-4 text-blue-400 font-bold text-sm">OU</span>
                  <div className="flex-grow border-t border-blue-800"></div>
              </div>
               <input 
                 type="text" 
                 placeholder="ENTRER UN CODE" 
                 className="w-full bg-blue-900 border-2 border-blue-800 rounded-2xl p-4 text-center font-bold text-xl outline-none focus:border-yellow-400 transition-colors uppercase text-white placeholder-blue-700"
               />
               <Button variant="secondary" className="w-full py-4 text-lg shadow-lg shadow-blue-900/50">
                 Rejoindre
               </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-green-100">
      {screen !== 'duel' && (
        <Header 
          userState={userState} 
          currentLang={currentLang} 
          setLang={setCurrentLang}
          goHome={() => setScreen('home')} 
        />
      )}
      
      <main className="mx-auto">
        {screen === 'home' && renderHomeScreen()}
        {screen === 'flashcards' && renderFlashcards()}
        {screen === 'quiz' && renderQuiz()}
        {screen === 'duel' && renderDuel()}
      </main>
    </div>
  );
}