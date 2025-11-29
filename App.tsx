import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, 
  Zap, 
  BookOpen, 
  Trophy, 
  Swords, 
  ChevronLeft, 
  RotateCw, 
  Check, 
  X,
  Volume2,
  Globe,
  Home,
  Menu
} from 'lucide-react';

// --- Types ---

type Language = 'fr' | 'ru';

interface Word {
  id: string;
  sango: string;
  fr: string; // French
  ru: string; // Russian
}

interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
  words: Word[];
}

type Screen = 'home' | 'flashcards' | 'quiz' | 'duel' | 'duel-game';

interface UserState {
  hearts: number;
  xp: number;
  streak: number;
  completedCategories: string[];
}

// --- Data Source (Based on provided OCR) ---

const VOCABULARY: Category[] = [
  {
    id: 'salutations',
    title: 'Salutations',
    icon: '👋',
    color: 'bg-green-500',
    words: [
      { id: 's1', sango: 'Bara mo', fr: 'Bonjour / Salut', ru: 'Привет / Здравствуйте' },
      { id: 's2', sango: 'Nzoni gango', fr: 'Bienvenue', ru: 'Добро пожаловать' },
      { id: 's3', sango: 'Töngana nye?', fr: 'Comment vas-tu ?', ru: 'Как дела?' },
      { id: 's4', sango: 'Mbï yeke sêngê', fr: 'Je vais bien', ru: 'У меня все хорошо' },
      { id: 's5', sango: 'Singîla', fr: 'Merci', ru: 'Спасибо' },
      { id: 's6', sango: 'Singîla mingi', fr: 'Merci beaucoup', ru: 'Большое спасибо' },
      { id: 's7', sango: 'Gbu gere ti ala', fr: 'Excusez-moi', ru: 'Извините' },
      { id: 's8', sango: 'Lango Njönî', fr: 'Bonne nuit', ru: 'Спокойной ночи' },
      { id: 's9', sango: 'Na kekereke', fr: 'À demain', ru: 'До завтра' },
      { id: 's10', sango: 'Na ngia', fr: 'Enchanté', ru: 'Приятно познакомиться' }
    ]
  },
  {
    id: 'people',
    title: 'Gens & Identité',
    icon: '👤',
    color: 'bg-blue-500',
    words: [
      { id: 'p1', sango: 'Ïrï tî mo nye?', fr: 'Quel est ton nom ?', ru: 'Как тебя зовут?' },
      { id: 'p2', sango: 'Irï tî mbï...', fr: 'Mon nom est...', ru: 'Меня зовут...' },
      { id: 'p3', sango: 'Kôlï', fr: 'Homme', ru: 'Мужчина' },
      { id: 'p4', sango: 'Wâlï', fr: 'Femme', ru: 'Женщина' },
      { id: 'p5', sango: 'Môlengê', fr: 'Enfant', ru: 'Ребенок' },
      { id: 'p6', sango: 'Babâ', fr: 'Père', ru: 'Отец' },
      { id: 'p7', sango: 'Mamâ', fr: 'Mère', ru: 'Мать' },
      { id: 'p8', sango: 'Ita-kôlï', fr: 'Frère', ru: 'Брат' },
      { id: 'p9', sango: 'Ita-wâlï', fr: 'Sœur', ru: 'Сестра' },
      { id: 'p10', sango: 'Kamarade', fr: 'Ami', ru: 'Друг' }
    ]
  },
  {
    id: 'numbers',
    title: 'Nombres',
    icon: '🔢',
    color: 'bg-yellow-500',
    words: [
      { id: 'n1', sango: 'Ôko', fr: 'Un', ru: 'Один' },
      { id: 'n2', sango: 'Üse', fr: 'Deux', ru: 'Два' },
      { id: 'n3', sango: 'Otâ', fr: 'Trois', ru: 'Три' },
      { id: 'n4', sango: 'Osiô', fr: 'Quatre', ru: 'Четыре' },
      { id: 'n5', sango: 'Okuë', fr: 'Cinq', ru: 'Пять' },
      { id: 'n6', sango: 'Omënë', fr: 'Six', ru: 'Шесть' },
      { id: 'n7', sango: 'Mbasambala', fr: 'Sept', ru: 'Семь' },
      { id: 'n8', sango: 'Miombe', fr: 'Huit', ru: 'Восемь' },
      { id: 'n9', sango: 'Gumbaya', fr: 'Neuf', ru: 'Девять' },
      { id: 'n10', sango: 'Bale ôko', fr: 'Dix', ru: 'Десять' }
    ]
  },
  {
    id: 'food',
    title: 'Nourriture',
    icon: '🍎',
    color: 'bg-orange-500',
    words: [
      { id: 'f1', sango: 'Kôbe', fr: 'Nourriture', ru: 'Еда' },
      { id: 'f2', sango: 'Ngû', fr: 'Eau', ru: 'Вода' },
      { id: 'f3', sango: 'Mapa', fr: 'Pain', ru: 'Хлеб' },
      { id: 'f4', sango: 'Lôssô', fr: 'Riz', ru: 'Рис' },
      { id: 'f5', sango: 'Nyama', fr: 'Viande', ru: 'Мясо' },
      { id: 'f6', sango: 'Sûsû', fr: 'Poisson', ru: 'Рыба' },
      { id: 'f7', sango: 'Te', fr: 'Manger', ru: 'Есть (кушать)' },
      { id: 'f8', sango: 'Nyön', fr: 'Boire', ru: 'Пить' },
      { id: 'f9', sango: 'Vo', fr: 'Acheter', ru: 'Покупать' },
      { id: 'f10', sango: 'Ka', fr: 'Vendre', ru: 'Продавать' }
    ]
  },
  {
    id: 'nature',
    title: 'Temps & Couleurs',
    icon: '🌤️',
    color: 'bg-purple-500',
    words: [
      { id: 't1', sango: 'Lâsô', fr: "Aujourd'hui", ru: 'Сегодня' },
      { id: 't2', sango: 'Kekereke', fr: 'Demain', ru: 'Завтра' },
      { id: 't3', sango: 'Vûko', fr: 'Noir', ru: 'Черный' },
      { id: 't4', sango: 'Vuru', fr: 'Blanc', ru: 'Белый' },
      { id: 't5', sango: 'Bengba', fr: 'Rouge', ru: 'Красный' },
      { id: 't6', sango: 'Ngu ngunza', fr: 'Vert', ru: 'Зеленый' },
      { id: 't7', sango: 'Kambiri', fr: 'Jaune', ru: 'Желтый' },
      { id: 't8', sango: 'Wâ', fr: 'Chaud', ru: 'Горячий' },
      { id: 't9', sango: 'Dë', fr: 'Froid', ru: 'Холодный' },
      { id: 't10', sango: 'Mingi', fr: 'Beaucoup', ru: 'Много' }
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
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'; 
  className?: string;
  disabled?: boolean;
}) => {
  const baseStyle = "font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center uppercase tracking-wide disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-green-500 hover:bg-green-400 text-white border-b-4 border-green-700 active:border-b-0 active:translate-y-1",
    secondary: "bg-blue-500 hover:bg-blue-400 text-white border-b-4 border-blue-700 active:border-b-0 active:translate-y-1",
    danger: "bg-red-500 hover:bg-red-400 text-white border-b-4 border-red-700 active:border-b-0 active:translate-y-1",
    outline: "bg-white hover:bg-gray-50 text-slate-700 border-2 border-slate-200 border-b-4 hover:border-slate-300 active:border-b-2 active:translate-y-0.5",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-500 border-none"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

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
      <div className="flex gap-2">
        <button onClick={goHome} className="text-slate-400 hover:text-slate-600 transition-colors">
          <Home size={28} />
        </button>
        <button 
          onClick={() => setLang(currentLang === 'fr' ? 'ru' : 'fr')}
          className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 border-b-2 border-slate-300 active:border-b-0 active:translate-y-0.5"
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
          <Heart className="text-red-500 fill-current" size={24} />
          <span className="font-bold text-red-500 text-lg">{userState.hearts}</span>
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
    const otherWords = VOCABULARY.flatMap(c => c.words)
      .filter(w => w.id !== correctWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const options = [correctWord, ...otherWords]
      .sort(() => 0.5 - Math.random())
      .map(w => currentLang === 'fr' ? w.fr : w.ru);
      
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
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold text-slate-700">Apprendre le Sango</h1>
        <p className="text-slate-500">
          {currentLang === 'fr' ? "Mode Français 🇨🇫 🇫🇷" : "Режим Русский 🇨🇫 🇷🇺"}
        </p>
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
                bg-white border-2 border-slate-200 rounded-3xl p-4 shadow-sm hover:border-slate-300 transition-all cursor-pointer
                ${userState.completedCategories.includes(category.id) ? 'border-yellow-400 bg-yellow-50' : ''}
              `}
              onClick={() => handleStartActivity(category, 'quiz')}
            >
              <div className={`w-16 h-16 rounded-2xl ${category.color} flex items-center justify-center text-3xl shadow-lg mb-3 mx-auto transform group-hover:scale-110 transition-transform`}>
                {category.icon}
              </div>
              <h3 className="text-center font-bold text-slate-700 text-lg">{category.title}</h3>
              
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

      <div className="mt-12 p-6 bg-indigo-900 rounded-3xl text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <h2 className="text-2xl font-bold mb-2 relative z-10">Mode Duel</h2>
        <p className="mb-6 opacity-80 relative z-10">Défiez vos amis dans un combat de vocabulaire !</p>
        <Button variant="secondary" className="w-full relative z-10" onClick={() => setScreen('duel')}>
          <Swords className="mr-2" /> Commencer le Duel
        </Button>
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
               <h2 className="text-4xl md:text-5xl font-extrabold text-slate-700 text-center">{word.sango}</h2>
               <div className="mt-8 p-3 rounded-full bg-slate-100 text-blue-500 hover:bg-slate-200 transition-colors">
                  <Volume2 size={32} />
               </div>
               <p className="absolute bottom-6 text-slate-400 text-sm animate-pulse">Appuyez pour retourner</p>
            </div>

            {/* Back */}
            <div className="absolute inset-0 w-full h-full bg-indigo-500 border-2 border-indigo-600 border-b-[6px] rounded-3xl flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180 shadow-lg text-white">
               <span className="text-indigo-200 font-bold uppercase tracking-widest text-sm mb-6">
                 {currentLang === 'fr' ? 'Français' : 'Русский'}
               </span>
               <h2 className="text-3xl md:text-4xl font-extrabold text-center">
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
           <div className="flex items-center text-red-500 font-bold">
             <Heart className="fill-current mr-1" size={20} /> {userState.hearts}
           </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-slate-700 mb-8 text-center">
            Traduisez cette phrase
          </h2>
          
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-4">
               <div className="w-24 h-24 bg-blue-500 rounded-2xl flex items-center justify-center text-4xl shadow-md">
                 🦁
               </div>
               <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm relative">
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
                  <div className={`p-2 rounded-full ${answerStatus === 'correct' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                    {answerStatus === 'correct' ? <Check size={24} /> : <X size={24} />}
                  </div>
                  <span className={`text-xl font-bold ${answerStatus === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
                    {answerStatus === 'correct' ? 'Excellent !' : `La bonne réponse était: ${currentLang === 'fr' ? word.fr : word.ru}`}
                  </span>
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
      <div className="flex flex-col h-screen bg-slate-900 text-white p-6 items-center justify-center">
        <Button variant="ghost" className="absolute top-4 left-4 text-white hover:bg-white/10" onClick={() => setScreen('home')}>
          <ChevronLeft /> Retour
        </Button>
        
        <Swords size={80} className="text-yellow-400 mb-6 animate-bounce-sm" />
        <h1 className="text-4xl font-extrabold mb-2 text-center">MODE DUEL</h1>
        <p className="text-slate-400 mb-8 text-center max-w-xs">Générez un code et affrontez un ami sur le vocabulaire Sango !</p>

        {duelCode ? (
           <div className="w-full max-w-sm bg-slate-800 p-8 rounded-3xl border-2 border-slate-700 text-center animate-in zoom-in duration-300">
             <p className="text-sm font-bold text-slate-400 uppercase mb-2">Code de Combat</p>
             <h2 className="text-4xl font-mono font-bold text-green-400 tracking-widest mb-6">{duelCode}</h2>
             <div className="space-y-3">
               <Button variant="primary" className="w-full" onClick={() => setScreen('quiz')}>
                 Lancer le défi
               </Button>
               <Button variant="ghost" className="w-full text-slate-400 hover:text-white" onClick={() => setDuelCode('')}>
                 Annuler
               </Button>
             </div>
           </div>
        ) : (
          <div className="w-full max-w-sm space-y-4">
             <Button 
               variant="primary" 
               className="w-full py-4 text-lg"
               onClick={() => setDuelCode(Math.random().toString(36).substring(2, 7).toUpperCase())}
             >
               Créer une Salle
             </Button>
             <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-700"></div>
                <span className="flex-shrink mx-4 text-slate-500">OU</span>
                <div className="flex-grow border-t border-slate-700"></div>
            </div>
             <input 
               type="text" 
               placeholder="Entrer un code..." 
               className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl p-4 text-center font-bold text-xl outline-none focus:border-blue-500 transition-colors uppercase"
             />
             <Button variant="secondary" className="w-full py-4 text-lg">
               Rejoindre
             </Button>
          </div>
        )}
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