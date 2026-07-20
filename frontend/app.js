const { useState, useEffect, useRef } = React;

// Shuffle options for each question so correct answer isn't always at the same position
function shuffleQuestionOptions(questions) {
    return questions.map(q => {
        const correctText = q.options[q.correct];
        // Fisher-Yates shuffle on a copy of the options array
        const shuffled = [...q.options];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        // Find the new index of the correct answer
        const newCorrectIndex = shuffled.indexOf(correctText);
        return { ...q, options: shuffled, correct: newCorrectIndex };
    });
}

// 12-Level Tense Curriculum Catalog
const LEVELS = [
    { id: 1, name: "Level 1: Present Simple Tense", desc: "Habits, facts aur daily routine translations. (e.g. 'Main daudta hoon')", count: 25, difficulty: "Basic", icon: "fa-bolt", color: "from-blue-500 to-indigo-600", category: "present" },
    { id: 2, name: "Level 2: Present Continuous Tense", desc: "Abhi chal rahe actions ki translations. (e.g. 'Bache khel rahe hain')", count: 25, difficulty: "Basic", icon: "fa-sync", color: "from-indigo-500 to-purple-600", category: "present" },
    { id: 3, name: "Level 3: Present Perfect Tense", desc: "Abhi-abhi khatam hue actions ki translations. (e.g. 'Maine khana kha liya hai')", count: 25, difficulty: "Basic", icon: "fa-check-double", color: "from-purple-500 to-pink-600", category: "present" },
    { id: 4, name: "Level 4: Present Perfect Continuous", desc: "Kisi samay se chal rahe present actions. (e.g. 'Subah se baarish ho rahi hai')", count: 25, difficulty: "Conversational", icon: "fa-hourglass-half", color: "from-emerald-500 to-teal-600", category: "present" },
    { id: 5, name: "Level 5: Past Simple Tense", desc: "Completed past actions ki translations. (e.g. 'Main kal wahan gaya')", count: 25, difficulty: "Basic", icon: "fa-history", color: "from-amber-500 to-orange-600", category: "past" },
    { id: 6, name: "Level 6: Past Continuous Tense", desc: "Past mein chal rahe actions ki translations. (e.g. 'Mummy khana bana rahi thi')", count: 25, difficulty: "Basic", icon: "fa-running", color: "from-teal-500 to-cyan-600", category: "past" },
    { id: 7, name: "Level 7: Past Perfect Tense", desc: "Earlier past completed actions. (e.g. 'Train ja chuki thi mere aane se pehle')", count: 25, difficulty: "Intermediate", icon: "fa-calendar-check", color: "from-cyan-500 to-blue-600", category: "past" },
    { id: 8, name: "Level 8: Past Perfect Continuous", desc: "Past range duration translations. (e.g. 'Wo do ghante se padh raha tha')", count: 25, difficulty: "Intermediate", icon: "fa-clock", color: "from-rose-500 to-red-600", category: "past" },
    { id: 9, name: "Level 9: Future Simple Tense", desc: "Aane wale kal ke plans aur promises. (e.g. 'Main kal tumse milunga')", count: 30, difficulty: "Basic", icon: "fa-paper-plane", color: "from-blue-600 to-teal-500", category: "future" },
    { id: 10, name: "Level 10: Future Continuous Tense", desc: "Future in-progress actions. (e.g. 'Kal is samay hum safar kar rahe honge')", count: 30, difficulty: "Intermediate", icon: "fa-location-arrow", color: "from-emerald-600 to-indigo-500", category: "future" },
    { id: 11, name: "Level 11: Future Perfect Tense", desc: "Future completions checklist. (e.g. 'Hum kaam poora kar chuke honge')", count: 30, difficulty: "Intermediate", icon: "fa-flag-checkered", color: "from-pink-600 to-rose-500", category: "future" },
    { id: 12, name: "Level 12: Future Perfect Continuous", desc: "Future duration milestone challenges. (e.g. 'Das saal ho chuke honge yahan')", count: 35, difficulty: "Advanced", icon: "fa-crown", color: "from-amber-600 to-red-600", category: "future" }
];

// Grammar Reference Study Guide Data
const TENSE_GUIDE_DATA = [
    {
        id: 1,
        name: "Level 1: Present Simple Tense",
        category: "present",
        desc: "Jab koi kaam rozana hota hai (Habits/Routines), ya koi general fact/universal truth ho.",
        formula: {
            aff: "Subject + V1 (s/es) + Object",
            neg: "Subject + do/does + not + V1 + Object",
            int: "Do/Does + Subject + V1 + Object?"
        },
        examples: [
            { hin: "Main roz subah daudta hoon.", eng: "I run every morning." },
            { hin: "Wo English bolta hai.", eng: "He speaks English." },
            { hin: "Kya tum mujhe jante ho?", eng: "Do you know me?" }
        ]
    },
    {
        id: 2,
        name: "Level 2: Present Continuous Tense",
        category: "present",
        desc: "Jab koi kaam abhi active chal raha hai (Actions in progress right now).",
        formula: {
            aff: "Subject + is/am/are + V-ing + Object",
            neg: "Subject + is/am/are + not + V-ing + Object",
            int: "Is/Am/Are + Subject + V-ing + Object?"
        },
        examples: [
            { hin: "Main abhi padh raha hoon.", eng: "I am studying now." },
            { hin: "Bache park mein khel rahe hain.", eng: "Children are playing in the park." },
            { hin: "Kya tum sun rahe ho?", eng: "Are you listening?" }
        ]
    },
    {
        id: 3,
        name: "Level 3: Present Perfect Tense",
        category: "present",
        desc: "Jab koi kaam beete kal me shuru hua par abhi-abhi poora hua hai (Just finished actions).",
        formula: {
            aff: "Subject + has/have + V3 + Object",
            neg: "Subject + has/have + not + V3 + Object",
            int: "Has/Have + Subject + V3 + Object?"
        },
        examples: [
            { hin: "Maine khana kha liya hai.", eng: "I have eaten food." },
            { hin: "Wo ghar chala gaya hai.", eng: "He has gone home." },
            { hin: "Kya tumne use dekha hai?", eng: "Have you seen him?" }
        ]
    },
    {
        id: 4,
        name: "Level 4: Present Perfect Continuous",
        category: "present",
        desc: "Jab koi kaam pehle shuru hua, abhi chal raha ho aur sath me time duration (since/for) diya gaya ho.",
        formula: {
            aff: "Subject + has/have + been + V-ing + since/for + Object",
            neg: "Subject + has/have + not + been + V-ing + since/for + Object",
            int: "Has/Have + Subject + been + V-ing + since/for + Object?"
        },
        examples: [
            { hin: "Subah se baarish ho rahi hai.", eng: "It has been raining since morning." },
            { hin: "Wo do ghante se padh raha hai.", eng: "He has been studying for two hours." },
            { hin: "Main 2015 se Delhi mein reh raha hoon.", eng: "I have been living in Delhi since 2015." }
        ]
    },
    {
        id: 5,
        name: "Level 5: Past Simple Tense",
        category: "past",
        desc: "Beete kal ke khatam hue actions ko darshane ke liye (Completed past actions).",
        formula: {
            aff: "Subject + V2 + Object",
            neg: "Subject + did + not + V1 + Object (Negative me V1 lagti hai)",
            int: "Did + Subject + V1 + Object?"
        },
        examples: [
            { hin: "Main kal wahan gaya.", eng: "I went there yesterday." },
            { hin: "Usne mujhe ek kahani sunayi.", eng: "He told me a story." },
            { hin: "Kya tumne kal match dekha?", eng: "Did you watch the match yesterday?" }
        ]
    },
    {
        id: 6,
        name: "Level 6: Past Continuous Tense",
        category: "past",
        desc: "Beete kal mein koi kaam chal raha tha (Actions in progress in the past).",
        formula: {
            aff: "Subject + was/were + V-ing + Object",
            neg: "Subject + was/were + not + V-ing + Object",
            int: "Was/Were + Subject + V-ing + Object?"
        },
        examples: [
            { hin: "Main so raha tha.", eng: "I was sleeping." },
            { hin: "Mummy kapde dho rahi thi.", eng: "Mother was washing clothes." },
            { hin: "Kya tum so rahe the?", eng: "Were you sleeping?" }
        ]
    },
    {
        id: 7,
        name: "Level 7: Past Perfect Tense",
        category: "past",
        desc: "Past mein do actions me se pehla action jo pehle hi complete ho chuka tha.",
        formula: {
            aff: "Subject + had + V3 + Object",
            neg: "Subject + had + not + V3 + Object",
            int: "Had + Subject + V3 + Object?"
        },
        examples: [
            { hin: "Doctor ke aane se pehle rogi mar chuka tha.", eng: "The patient had died before the doctor came." },
            { hin: "Mere station pahunchne se pehle train ja chuki thi.", eng: "The train had left before I reached the station." }
        ]
    },
    {
        id: 8,
        name: "Level 8: Past Perfect Continuous",
        category: "past",
        desc: "Past mein koi kaam chal raha tha aur beete samay ke time milestone (since/for) ke sath relate ho.",
        formula: {
            aff: "Subject + had + been + V-ing + since/for + Object",
            neg: "Subject + had + not + been + V-ing + since/for + Object",
            int: "Had + Subject + been + V-ing + since/for + Object?"
        },
        examples: [
            { hin: "Main do ghante se tumhara intezar kar raha tha.", eng: "I had been waiting for you for two hours." },
            { hin: "Kal subah se baarish ho rahi thi.", eng: "It had been raining since yesterday morning." }
        ]
    },
    {
        id: 9,
        name: "Level 9: Future Simple Tense",
        category: "future",
        desc: "Aane wale kal mein aam plans, commitments ya predictions ke liye.",
        formula: {
            aff: "Subject + will + V1 + Object",
            neg: "Subject + will + not + V1 + Object",
            int: "Will + Subject + V1 + Object?"
        },
        examples: [
            { hin: "Main kal tumse milunga.", eng: "I will meet you tomorrow." },
            { hin: "Wo kal gaana gayega.", eng: "He will sing a song tomorrow." },
            { hin: "Kya tum aayoge?", eng: "Will you come?" }
        ]
    },
    {
        id: 10,
        name: "Level 10: Future Continuous Tense",
        category: "future",
        desc: "Aane wale kal mein koi kaam chal raha hoga (Actions in progress in future).",
        formula: {
            aff: "Subject + will + be + V-ing + Object",
            neg: "Subject + will + not + be + V-ing + Object",
            int: "Will + Subject + be + V-ing + Object?"
        },
        examples: [
            { hin: "Kal is samay main padh raha hunga.", eng: "I will be studying at this time tomorrow." },
            { hin: "Bache khel rahe honge.", eng: "Children will be playing." },
            { hin: "Kya papa TV dekh rahe honge?", eng: "Will father be watching TV?" }
        ]
    },
    {
        id: 11,
        name: "Level 11: Future Perfect Tense",
        category: "future",
        desc: "Aane wale kal mein ek specific time/action se pehle jo completed ho chuka hoga.",
        formula: {
            aff: "Subject + will + have + V3 + Object",
            neg: "Subject + will + not + have + V3 + Object",
            int: "Will + Subject + have + V3 + Object?"
        },
        examples: [
            { hin: "Agale hafte tak hum project poora kar chuke honge.", eng: "We will have completed our project by next week." },
            { hin: "Mummy khana bana chuki hogi.", eng: "Mother will have cooked food." }
        ]
    },
    {
        id: 12,
        name: "Level 12: Future Perfect Continuous",
        category: "future",
        desc: "Future mein kisi time milestone tak continuous action ki duration poori ho rahi hogi.",
        formula: {
            aff: "Subject + will + have + been + V-ing + since/for + Object",
            neg: "Subject + will + not + have + been + V-ing + since/for + Object",
            int: "Will + Subject + have + been + V-ing + since/for + Object?"
        },
        examples: [
            { hin: "2028 tak mujhe kaam karte das saal ho chuke honge.", eng: "By 2028, I will have been working here for ten years." },
            { hin: "Wo do ghante se khel raha hoga.", eng: "He will have been playing for two hours." }
        ]
    }
];

// Helper to compile syntax highlighted HTML for formulas
const highlightFormula = (formulaStr) => {
    if (!formulaStr) return '';
    return formulaStr
        .replace(/Subject/g, '<span class="syntax-sub">Subject</span>')
        .replace(/Sub/g, '<span class="syntax-sub">Sub</span>')
        .replace(/V1/g, '<span class="syntax-verb">V1</span>')
        .replace(/V2/g, '<span class="syntax-verb">V2</span>')
        .replace(/V3/g, '<span class="syntax-verb">V3</span>')
        .replace(/V-ing/g, '<span class="syntax-verb">V-ing</span>')
        .replace(/Object/g, '<span class="syntax-obj">Object</span>')
        .replace(/Obj/g, '<span class="syntax-obj">Obj</span>')
        .replace(/(is\/am\/are|has\/have|been|did|do\/does|will|will be|will have|will have been|had|had been)/g, '<span class="syntax-help">$1</span>');
};

function App() {
    const [currentLevel, setCurrentLevel] = useState(null); // Selected level object
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const [step, setStep] = useState('start'); // start, quiz, results
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [answers, setAnswers] = useState([]);
    
    // View Mode ('quiz' or 'guide')
    const [viewMode, setViewMode] = useState('quiz'); 

    // UI Category Tabs state
    const [activeTab, setActiveTab] = useState('present'); // present, past, future

    // Settings
    const [darkMode, setDarkMode] = useState(true);
    const [soundOn, setSoundOn] = useState(true);
    const [timerEnabled, setTimerEnabled] = useState(true);
    
    // Lifelines / Help state
    const [hasFiftyFifty, setHasFiftyFifty] = useState(true);
    const [eliminatedOptions, setEliminatedOptions] = useState([]);
    const [hintUsedThisQuestion, setHintUsedThisQuestion] = useState(false);
    const [pointsPotential, setPointsPotential] = useState(1.0); // Penalty if hints are used

    // Timer state
    const [timeLeft, setTimeLeft] = useState(15);
    const timerRef = useRef(null);

    // Review settings
    const [reviewFilter, setReviewFilter] = useState('all'); // all, correct, incorrect

    // References
    const confettiCanvasRef = useRef(null);

    // Refs to store state values for event listeners to avoid stale closure traps
    const currentLevelRef = useRef(currentLevel);
    const stepRef = useRef(step);
    
    useEffect(() => {
        currentLevelRef.current = currentLevel;
        stepRef.current = step;
    }, [currentLevel, step]);

    // Synchronize state with Hash Routing (Back button support)
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            const currentLevelVal = currentLevelRef.current;
            const stepVal = stepRef.current;
            
            // Handle home states
            if (!hash || hash === '#/' || hash === '#levels') {
                setCurrentLevel(null);
                setQuestions([]);
                setStep('start');
                setViewMode('quiz');
            } else if (hash === '#guide') {
                setCurrentLevel(null);
                setQuestions([]);
                setStep('start');
                setViewMode('guide');
            } else if (hash.startsWith('#level-')) {
                // Parse level parameters e.g., #level-1 or #level-1/results
                const parts = hash.replace('#level-', '').split('/');
                const levelId = parseInt(parts[0], 10);
                const isResults = parts[1] === 'results';
                
                const levelObj = LEVELS.find(l => l.id === levelId);
                if (levelObj) {
                    setViewMode('quiz');
                    setActiveTab(levelObj.category);

                    // Fetch logic if not loaded or if switching level IDs
                    if (!currentLevelVal || currentLevelVal.id !== levelId) {
                        setLoading(true);
                        setFetchError(null);
                        setCurrentLevel(levelObj);
                        
                        fetch(`/questions.json`)
                            .then(res => {
                                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                                return res.json();
                            })
                            .then(data => {
                                const filtered = data.filter(q => q.levelId === levelId);
                                const shuffled = shuffleQuestionOptions(filtered);
                                setQuestions(shuffled);
                                setCurrentQ(0);
                                setScore(0);
                                setSelected(null);
                                setShowFeedback(false);
                                setAnswers([]);
                                setHasFiftyFifty(true);
                                setEliminatedOptions([]);
                                setHintUsedThisQuestion(false);
                                setPointsPotential(1.0);
                                setStep(isResults ? 'results' : 'quiz');
                                setLoading(false);
                            })
                            .catch(err => {
                                console.error("Router Fetch Error:", err);
                                setFetchError("Sawal download nahi ho sake. Check karein ki internet connection thik hai.");
                                setLoading(false);
                            });
                    } else {
                        // Reset states if navigating from results back to quiz (Retry action)
                        if (stepVal === 'results' && !isResults) {
                            setCurrentQ(0);
                            setScore(0);
                            setSelected(null);
                            setShowFeedback(false);
                            setAnswers([]);
                            setHasFiftyFifty(true);
                            setEliminatedOptions([]);
                            setHintUsedThisQuestion(false);
                            setPointsPotential(1.0);
                        }
                        setStep(isResults ? 'results' : 'quiz');
                    }
                }
            }
        };

        // Initialize default hash on load if not set
        if (!window.location.hash) {
            window.location.hash = '#levels';
        } else {
            handleHashChange();
        }

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []); // Empty dependency array. Runs exactly once on mount.

    // Synchronize dark class on document
    useEffect(() => {
        const rootEl = document.documentElement;
        if (darkMode) {
            rootEl.classList.add('dark');
            document.body.classList.remove('light-theme');
        } else {
            rootEl.classList.remove('dark');
            document.body.classList.add('light-theme');
        }
    }, [darkMode]);

    // Sync sound setting to local player object
    useEffect(() => {
        if (window.audio) {
            window.audio.enabled = soundOn;
        }
    }, [soundOn]);

    // Timer tick logic
    useEffect(() => {
        if (step === 'quiz' && timerEnabled && !showFeedback && questions.length > 0) {
            setTimeLeft(15);
            if (timerRef.current) clearInterval(timerRef.current);
            
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleTimeOut();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [currentQ, step, showFeedback, timerEnabled, questions]);

    // Handle timer expiration
    const handleTimeOut = () => {
        if (window.audio) window.audio.playIncorrect();
        setSelected(-1); // Indication that no choice was made
        setShowFeedback(true);
        setAnswers(prev => [...prev, {
            q: questions[currentQ].question,
            user: -1,
            correct: questions[currentQ].correct,
            isCorrect: false,
            earnedPoints: 0,
            explanation: questions[currentQ].rationale
        }]);
    };

    // SPA state change commands (routing update triggers)
    const selectLevel = (levelObj) => {
        window.location.hash = `#level-${levelObj.id}`;
    };

    const applyFiftyFifty = () => {
        if (!hasFiftyFifty || showFeedback) return;
        if (window.audio) window.audio.playLifeline();
        const q = questions[currentQ];
        const incorrectIndices = [];
        q.options.forEach((_, idx) => {
            if (idx !== q.correct) {
                incorrectIndices.push(idx);
            }
        });
        const shuffled = incorrectIndices.sort(() => 0.5 - Math.random());
        setEliminatedOptions([shuffled[0], shuffled[1]]);
        setHasFiftyFifty(false);
    };

    const useHint = () => {
        if (hintUsedThisQuestion || showFeedback) return;
        if (window.audio) window.audio.playLifeline();
        setHintUsedThisQuestion(true);
        setPointsPotential(0.5);
    };

    const handleOptionClick = (index) => {
        if (showFeedback || eliminatedOptions.includes(index)) return;
        if (timerRef.current) clearInterval(timerRef.current);
        
        setSelected(index);
        setShowFeedback(true);
        
        const isCorrect = index === questions[currentQ].correct;
        const pointsEarned = isCorrect ? pointsPotential : 0;
        
        if (isCorrect) {
            if (window.audio) window.audio.playCorrect();
            setScore(s => s + pointsEarned);
        } else {
            if (window.audio) window.audio.playIncorrect();
        }
        
        setAnswers(prev => [...prev, {
            q: questions[currentQ].question,
            user: index,
            correct: questions[currentQ].correct,
            isCorrect,
            earnedPoints: pointsEarned,
            explanation: questions[currentQ].rationale
        }]);
    };

    const handleNext = () => {
        if (window.audio) window.audio.playClick();
        if (currentQ < questions.length - 1) {
            setCurrentQ(c => c + 1);
            setSelected(null);
            setShowFeedback(false);
            setEliminatedOptions([]);
            setHintUsedThisQuestion(false);
            setPointsPotential(1.0);
        } else {
            window.location.hash = `#level-${currentLevel.id}/results`;
        }
    };

    const loadNextLevel = () => {
        if (currentLevel.id < LEVELS.length) {
            window.location.hash = `#level-${currentLevel.id + 1}`;
        }
    };

    const backToMenu = () => {
        if (window.audio) window.audio.playClick();
        window.location.hash = '#levels';
    };

    // Score details helper
    const getScoreCategory = () => {
        if (questions.length === 0) return { title: "", desc: "", color: "" };
        const percentage = (score / questions.length) * 100;
        if (percentage >= 90) {
            return {
                title: "Translation Master 👑",
                desc: "Gazab! Aapka is Tense par pakad bemisaal hai. Shandar translation!",
                color: "text-indigo-400"
            };
        } else if (percentage >= 60) {
            return {
                title: "English Learner 📚",
                desc: "Boht Badiya! Aapka tense ka translation achha hai par thodi aur practice se aap fluent ban sakte hain.",
                color: "text-emerald-400"
            };
        } else {
            return {
                title: "Practice Buddy ✏️",
                desc: "Koi baat nahi! Tenses seekhne mein thoda waqt lagta hai. Is level ko dobara try karein!",
                color: "text-amber-400"
            };
        }
    };

    // Filtered items based on active tab category
    const filteredLevels = LEVELS.filter(level => level.category === activeTab);
    const filteredGuide = TENSE_GUIDE_DATA.filter(guide => guide.category === activeTab);

    // Loading Screen
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass-card rounded-3xl p-8 max-w-md w-full text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <h2 className="text-lg font-bold">Translations Load Ho Rahe Hain...</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{currentLevel ? currentLevel.name : 'Loading'} ke exercises database se load ho rahe hain.</p>
                </div>
            </div>
        );
    }

    // Connection Error Screen
    if (fetchError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass-card rounded-3xl p-8 max-w-md w-full text-center space-y-4 border border-red-500/20">
                    <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto text-xl">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 className="text-lg font-bold text-red-500">Connection Error!</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{fetchError}</p>
                    <div className="flex space-x-2">
                        <button 
                            onClick={backToMenu}
                            className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold active:scale-95 transition-all text-sm uppercase tracking-wider"
                        >
                            Main Menu
                        </button>
                        <button 
                            onClick={() => selectLevel(currentLevel)}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold active:scale-95 transition-all text-sm uppercase tracking-wider"
                        >
                            Retry Loading
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const scoreDetails = getScoreCategory();

    // Filter review list
    const filteredAnswers = answers.filter((ans, idx) => {
        if (reviewFilter === 'correct') return ans.isCorrect;
        if (reviewFilter === 'incorrect') return !ans.isCorrect;
        return true;
    });

    return (
        <div className="w-full max-w-3xl px-3 sm:px-4 py-6 sm:py-8 mx-auto relative z-10">
            
            {/* Header with Theme, Sound Toggle, and Main Navigation Toggles */}
            <header className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-5 sm:mb-6 border-b border-gray-200 dark:border-white/5 pb-3 sm:pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={backToMenu}>
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-neon-indigo hover:scale-105 transition-transform duration-200">
                            <i className="fas fa-feather-alt text-white text-base sm:text-lg"></i>
                        </div>
                        <span className="text-lg sm:text-xl font-bold tracking-tight">GrammarMaster</span>
                    </div>
                    {/* Sound & Theme - visible on mobile next to logo */}
                    <div className="flex items-center space-x-1.5 sm:hidden">
                        <button 
                            onClick={() => { if (window.audio) window.audio.playClick(); setSoundOn(!soundOn); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all glass-card hover:bg-opacity-80"
                            aria-label="Toggle Sound"
                        >
                            <i className={`fas ${soundOn ? 'fa-volume-up text-indigo-500' : 'fa-volume-mute text-gray-400'} text-xs`}></i>
                        </button>
                        <button 
                            onClick={() => { if (window.audio) window.audio.playClick(); setDarkMode(!darkMode); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all glass-card hover:bg-opacity-80"
                            aria-label="Toggle Dark Mode"
                        >
                            <i className={`fas ${darkMode ? 'fa-sun text-yellow-400' : 'fa-moon text-indigo-700'} text-xs`}></i>
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4 w-full sm:w-auto">
                    {/* Main Nav Toggle (Quiz vs Guide) - Pill Capsules */}
                    <div className="flex flex-1 sm:flex-none bg-gray-100 dark:bg-slate-900/50 p-1 rounded-full border border-gray-200 dark:border-white/5 shadow-inner">
                        <button
                            onClick={() => { if (window.audio) window.audio.playClick(); window.location.hash = '#levels'; }}
                            className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-extrabold text-[11px] sm:text-sm transition-all flex items-center justify-center space-x-1 ${
                                viewMode === 'quiz' 
                                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <i className="fas fa-gamepad text-[10px] sm:text-xs"></i>
                            <span>Quiz Arena</span>
                        </button>
                        <button
                            onClick={() => { if (window.audio) window.audio.playClick(); window.location.hash = '#guide'; }}
                            className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-extrabold text-[11px] sm:text-sm transition-all flex items-center justify-center space-x-1 ${
                                viewMode === 'guide' 
                                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <i className="fas fa-book-open text-[10px] sm:text-xs"></i>
                            <span>Tense Guide</span>
                        </button>
                    </div>

                    {/* Sound & Theme - hidden on mobile, shown on sm+ */}
                    <div className="hidden sm:flex items-center space-x-2">
                        <button 
                            onClick={() => { if (window.audio) window.audio.playClick(); setSoundOn(!soundOn); }}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all glass-card hover:bg-opacity-80"
                            aria-label="Toggle Sound"
                        >
                            <i className={`fas ${soundOn ? 'fa-volume-up text-indigo-500' : 'fa-volume-mute text-gray-400'} text-sm`}></i>
                        </button>
                        <button 
                            onClick={() => { if (window.audio) window.audio.playClick(); setDarkMode(!darkMode); }}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all glass-card hover:bg-opacity-80"
                            aria-label="Toggle Dark Mode"
                        >
                            <i className={`fas ${darkMode ? 'fa-sun text-yellow-400' : 'fa-moon text-indigo-700'} text-sm`}></i>
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN GAME INTERFACE CONTAINER */}
            <main className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
                
                {/* Start View: Level Selector or Tense Guide depending on viewMode */}
                {step === 'start' && (
                    <div className="space-y-6 slide-up">
                        
                        {/* Quiz Selector Screen */}
                        {viewMode === 'quiz' && (
                            <>
                                <div className="text-center space-y-2 py-2">
                                    <div className="relative inline-block">
                                        <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto shadow-neon-indigo pulse-glowing">
                                            <i className="fas fa-graduation-cap text-white text-2xl"></i>
                                        </div>
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Tense Translation Course</h1>
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                                        Tense by Tense Hinglish sentences ko translate karna seekhein aur Spoken English strong karein!
                                    </p>
                                </div>

                                {/* Configurations Toggle (Clean/Minimal) */}
                                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-slate-800/30 border border-indigo-200 dark:border-indigo-500/10 text-left max-w-xl mx-auto flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <i className="fas fa-stopwatch text-indigo-500 w-5"></i>
                                        <span className="text-xs sm:text-sm font-medium">15-Second Per-Question Timer</span>
                                    </div>
                                    <button
                                        onClick={() => { if (window.audio) window.audio.playClick(); setTimerEnabled(!timerEnabled); }}
                                        className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${timerEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${timerEnabled ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                    </button>
                                </div>

                                {/* Category Tab Selector - Capsule Pill styling */}
                                <div className="flex justify-center mb-4 sm:mb-6 overflow-x-auto no-scrollbar">
                                    <div className="inline-flex bg-gray-100 dark:bg-slate-900/50 p-1.5 rounded-full border border-gray-200 dark:border-white/5 shadow-inner">
                                        {['present', 'past', 'future'].map((tab) => (
                                            <button 
                                                key={tab}
                                                onClick={() => { if (window.audio) window.audio.playClick(); setActiveTab(tab); }}
                                                className={`px-3 sm:px-5 py-1.5 sm:py-2 font-extrabold text-[11px] sm:text-sm transition-all rounded-full capitalize whitespace-nowrap ${
                                                    activeTab === tab 
                                                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                                }`}
                                            >
                                                {tab} Tenses
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category Filtered Level Cards */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {filteredLevels.map((level) => (
                                        <button
                                            key={level.id}
                                            onClick={() => selectLevel(level)}
                                            className="option-button p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-slate-800/80 bg-white dark:bg-white/5 text-left flex flex-col justify-between space-y-3 hover:border-indigo-500/40 dark:hover:border-indigo-500/20 group"
                                        >
                                            {/* Glossy Refraction gradient highlight */}
                                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none rounded-2xl"></div>

                                            <div className="flex items-start space-x-3 w-full">
                                                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr ${level.color} text-white flex items-center justify-center text-lg shadow-md group-hover:scale-105 transition-transform duration-200`}>
                                                    <i className={`fas ${level.icon}`}></i>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] uppercase font-black text-indigo-500 dark:text-indigo-400">Level {level.id}</span>
                                                        <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold bg-indigo-500/10 text-indigo-400">{level.difficulty}</span>
                                                    </div>
                                                    <h3 className="font-extrabold text-sm sm:text-base text-ellipsis overflow-hidden whitespace-nowrap group-hover:text-indigo-400 transition-colors mt-0.5">{level.name}</h3>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1 line-clamp-2">{level.desc}</p>
                                            <div className="flex justify-between items-center text-[10px] font-semibold text-gray-500 border-t border-gray-100 dark:border-white/5 pt-2.5 w-full">
                                                <span><i className="fas fa-question-circle mr-1"></i>{level.count} Questions</span>
                                                <span className="group-hover:translate-x-1 transition-transform">Start <i className="fas fa-arrow-right ml-0.5"></i></span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Tense Study Guide Screen */}
                        {viewMode === 'guide' && (
                            <>
                                <div className="text-center space-y-2 py-2">
                                    <div className="relative inline-block">
                                        <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-700 rounded-2xl flex items-center justify-center mx-auto shadow-md pulse-glowing">
                                            <i className="fas fa-book-open text-white text-2xl"></i>
                                        </div>
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Tense Study Guide</h1>
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                                        Grammar Rules, Structures, and Hindi-to-English examples padhein aur seekhein!
                                    </p>
                                </div>

                                {/* Category Tab Selector - Capsule Pill styling */}
                                <div className="flex justify-center mb-6">
                                    <div className="inline-flex bg-gray-100 dark:bg-slate-900/50 p-1.5 rounded-full border border-gray-200 dark:border-white/5 shadow-inner">
                                        {['present', 'past', 'future'].map((tab) => (
                                            <button 
                                                key={tab}
                                                onClick={() => { if (window.audio) window.audio.playClick(); setActiveTab(tab); }}
                                                className={`px-5 py-2 font-extrabold text-xs sm:text-sm transition-all rounded-full capitalize ${
                                                    activeTab === tab 
                                                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                                }`}
                                            >
                                                {tab} Tenses
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Study Guide List */}
                                <div className="space-y-6">
                                    {filteredGuide.map((guide) => (
                                        <div 
                                            key={guide.id}
                                            className="p-5 sm:p-6 rounded-3xl border border-gray-200 dark:border-slate-800/80 bg-white dark:bg-white/5 text-left space-y-4 shadow-sm relative"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-3xl"></div>

                                            <div className="flex items-center space-x-3">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                                                    {guide.id}
                                                </div>
                                                <h3 className="font-extrabold text-base sm:text-lg text-indigo-600 dark:text-indigo-400">{guide.name}</h3>
                                            </div>
                                            
                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                                💡 <strong>Tense Kab Use Karein:</strong> {guide.desc}
                                            </p>

                                            {/* Formula Card Block with syntax highlights */}
                                            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xxs sm:text-xs space-y-2.5 font-mono text-slate-600 dark:text-gray-300">
                                                <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Sentence Formulas (Syntax Editor):</div>
                                                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-200 dark:border-white/5 pb-1">
                                                    <span className="font-bold text-gray-600 dark:text-gray-400">🟢 Affirmative:</span>
                                                    <span className="sm:text-right" dangerouslySetInnerHTML={{ __html: highlightFormula(guide.formula.aff) }} />
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-200 dark:border-white/5 pb-1">
                                                    <span className="font-bold text-gray-600 dark:text-gray-400">🔴 Negative:</span>
                                                    <span className="sm:text-right" dangerouslySetInnerHTML={{ __html: highlightFormula(guide.formula.neg) }} />
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                                    <span className="font-bold text-gray-600 dark:text-gray-400">🔵 Interrogative:</span>
                                                    <span className="sm:text-right" dangerouslySetInnerHTML={{ __html: highlightFormula(guide.formula.int) }} />
                                                </div>
                                            </div>

                                            {/* Example Translations */}
                                            <div className="space-y-2.5">
                                                <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Example Sentences:</div>
                                                <div className="grid gap-2">
                                                    {guide.examples.map((ex, idx) => (
                                                        <div key={idx} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-xs sm:text-sm flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                                            <div className="text-gray-500 dark:text-gray-400 flex items-center">
                                                                <span className="mr-1.5 text-xxs bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400 font-extrabold">🗣️ HIN</span> {ex.hin}
                                                            </div>
                                                            <div className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center">
                                                                <span className="mr-1.5 text-xxs bg-indigo-500/10 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-extrabold">🇬🇧 ENG</span> {ex.eng}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Quiz arena link */}
                                            <button
                                                onClick={() => {
                                                    const matchingLevelObj = LEVELS.find(l => l.id === guide.id);
                                                    if (matchingLevelObj) selectLevel(matchingLevelObj);
                                                }}
                                                className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold rounded-xl transition-all text-xs uppercase tracking-widest flex items-center justify-center space-x-2"
                                            >
                                                <i className="fas fa-play"></i>
                                                <span>Ab Iska Test Karein! (Play Level {guide.id} Quiz)</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Quiz View */}
                {step === 'quiz' && questions.length > 0 && (
                    <div className="space-y-6 slide-up">
                        {/* Top Progress and Status */}
                        <div className="flex flex-wrap justify-between items-center gap-2 text-sm font-semibold">
                            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                                <button onClick={backToMenu} className="text-[10px] sm:text-xs text-gray-400 hover:text-indigo-500 mr-1 sm:mr-2 flex items-center flex-shrink-0">
                                    <i className="fas fa-arrow-left mr-0.5 sm:mr-1"></i> Back
                                </button>
                                <span className="text-[10px] sm:text-sm text-indigo-500 dark:text-indigo-400 truncate">Q{currentQ + 1}/{questions.length}</span>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                                {timerEnabled && !showFeedback && (
                                    <div className="flex items-center space-x-1 bg-red-500/10 text-red-500 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs">
                                        <i className="fas fa-clock animate-pulse"></i>
                                        <span>{timeLeft}s</span>
                                    </div>
                                )}
                                <div className="bg-indigo-500/10 text-indigo-500 dark:text-indigo-300 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs">
                                    Score: {score}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500" 
                                style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                            ></div>
                        </div>

                        {/* Lifelines */}
                        {!showFeedback && (
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={applyFiftyFifty}
                                    disabled={!hasFiftyFifty}
                                    className={`px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold border transition-all ${
                                        hasFiftyFifty 
                                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20' 
                                        : 'bg-gray-200 dark:bg-slate-800 border-transparent text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <i className="fas fa-scissors mr-1"></i> 50-50 {hasFiftyFifty ? '' : '(Used)'}
                                </button>

                                <button
                                    onClick={useHint}
                                    disabled={hintUsedThisQuestion}
                                    className={`px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold border transition-all ${
                                        !hintUsedThisQuestion
                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20' 
                                        : 'bg-gray-200 dark:bg-slate-800 border-transparent text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <i className="fas fa-lightbulb mr-1"></i> Hint {hintUsedThisQuestion ? '' : '(-0.5 Pts)'}
                                </button>
                            </div>
                        )}

                        {/* Interactive Question Card */}
                        <div className="space-y-4 font-sans">
                            <h2 className="text-base sm:text-lg font-extrabold leading-snug">
                                {questions[currentQ].question}
                            </h2>

                            {/* Hint display */}
                            {hintUsedThisQuestion && !showFeedback && (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs slide-up flex items-start space-x-2">
                                    <i className="fas fa-info-circle mt-0.5"></i>
                                    <span><strong>Hint:</strong> {questions[currentQ].hint}</span>
                                </div>
                            )}

                            {/* Options */}
                            <div className="grid gap-3">
                                {questions[currentQ].options.map((opt, idx) => {
                                    const isSelected = selected === idx;
                                    const isCorrect = idx === questions[currentQ].correct;
                                    const isEliminated = eliminatedOptions.includes(idx);
                                    
                                    let btnStyle = "border-gray-300 dark:border-slate-800 bg-white dark:bg-white/5";
                                    let icon = null;

                                    if (showFeedback) {
                                        if (isCorrect) {
                                            btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-neon-green font-semibold";
                                            icon = <i className="fas fa-check-circle text-emerald-500 ml-auto text-sm sm:text-base"></i>;
                                        } else if (isSelected) {
                                            btnStyle = "border-red-500 bg-red-500/10 text-red-500 shadow-neon-red font-semibold";
                                            icon = <i className="fas fa-times-circle text-red-500 ml-auto text-sm sm:text-base"></i>;
                                        }
                                    } else if (isEliminated) {
                                        btnStyle = "opacity-30 border-dashed border-gray-300 dark:border-slate-700 bg-transparent cursor-not-allowed";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionClick(idx)}
                                            disabled={showFeedback || isEliminated}
                                            className={`option-button flex items-center p-3.5 rounded-2xl border-2 text-left w-full ${btnStyle}`}
                                        >
                                            <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center mr-3 text-xs sm:text-sm font-extrabold ${
                                                isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-500/10 text-indigo-500'
                                            }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="font-bold flex-1 text-xs sm:text-sm">{opt}</span>
                                            {icon}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Rationale feedback */}
                        {showFeedback && (
                            <div className="mt-4 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/10 slide-up space-y-3">
                                <div className="flex items-center space-x-2">
                                    {selected === questions[currentQ].correct ? (
                                        <span className="inline-flex items-center bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                                            ✅ Sahi Jawab!
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                                            ❌ Galat Jawab!
                                        </span>
                                    )}
                                    {pointsPotential < 1 && selected === questions[currentQ].correct && (
                                        <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded text-[9px] font-bold">
                                            Hint Penalty Applied (-0.5 Pts)
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-[10px] uppercase font-black text-gray-500 dark:text-gray-400 tracking-wider">Translation Rule & Rationale:</h4>
                                    <p className="text-xs sm:text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                        {questions[currentQ].rationale}
                                    </p>
                                </div>

                                <button 
                                    onClick={handleNext}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center space-x-2 text-xs uppercase tracking-widest"
                                >
                                    <span>Next Question</span>
                                    <i className="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Results View */}
                {step === 'results' && (
                    <div className="space-y-6 slide-up relative">
                        <canvas ref={confettiCanvasRef} id="confetti" className="absolute top-0 left-0 w-full h-full pointer-events-none z-20"></canvas>
                        
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-500 text-2xl shadow-neon-indigo">
                                <i className="fas fa-trophy"></i>
                            </div>

                            <div className="space-y-0.5">
                                <span className="text-[10px] uppercase font-black text-indigo-500 tracking-widest">{currentLevel ? currentLevel.name : ''} Complete</span>
                                <h2 className="text-xl sm:text-2xl font-black tracking-tight">Level Completed!</h2>
                            </div>

                            {/* Score Stats */}
                            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/10 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
                                    <span className="text-xl font-black text-indigo-500">{score}/{questions.length}</span>
                                    <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">Total Score</p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/10 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
                                    <span className="text-xl font-black text-indigo-500">{Math.round((score / questions.length) * 100)}%</span>
                                    <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">Percentage</p>
                                </div>
                            </div>

                            {/* Tier Badge */}
                            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 max-w-sm mx-auto border border-gray-200 dark:border-white/5 space-y-0.5 relative">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
                                <h3 className={`text-base font-extrabold ${scoreDetails.color}`}>{scoreDetails.title}</h3>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">
                                    "{scoreDetails.desc}"
                                </p>
                            </div>
                        </div>

                        <hr className="border-gray-200 dark:border-slate-800/80" />

                        {/* Translation Review list */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Translation Review</h3>
                                
                                <div className="flex bg-gray-200 dark:bg-slate-800/80 p-0.5 rounded-xl text-[10px] space-x-0.5">
                                    {['all', 'correct', 'incorrect'].map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => { if (window.audio) window.audio.playClick(); setReviewFilter(filter); }}
                                            className={`px-2.5 py-1.5 rounded-lg capitalize font-bold transition-all ${
                                                reviewFilter === filter 
                                                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 max-h-48 overflow-y-auto no-scrollbar pr-1">
                                {filteredAnswers.length > 0 ? (
                                    filteredAnswers.map((ans, idx) => {
                                        const originalQIdx = questions.findIndex(q => q.question === ans.q);
                                        if (originalQIdx === -1) return null;
                                        return (
                                            <div 
                                                key={idx} 
                                                className={`p-3.5 rounded-2xl border text-left text-xs space-y-2 bg-gray-50 dark:bg-white/5 relative ${
                                                    ans.isCorrect 
                                                    ? 'border-emerald-500/20' 
                                                    : 'border-red-500/20'
                                                }`}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-2xl"></div>
                                                <div className="flex justify-between items-start space-x-2">
                                                    <span className="font-bold flex-1">{ans.q}</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                                        ans.isCorrect ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                        {ans.isCorrect ? 'Sahi' : 'Galat'}
                                                    </span>
                                                </div>
                                                
                                                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                                    <div>Aapka javab: <span className="font-bold text-gray-700 dark:text-gray-200">{ans.user === -1 ? 'Time Expired / Not Selected' : questions[originalQIdx].options[ans.user]}</span></div>
                                                    <div>Sahi javab: <span className="font-bold text-indigo-600 dark:text-indigo-400">{questions[originalQIdx].options[ans.correct]}</span></div>
                                                </div>

                                                <p className="text-[10px] sm:text-xs bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/5 text-gray-600 dark:text-gray-300">
                                                    <strong>Formula & Vajah:</strong> {ans.explanation}
                                                </p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-4 text-xs text-gray-500 font-semibold">
                                        Is filter ke liye koi prashna nahi hai.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation buttons */}
                        <div className="grid gap-3 sm:grid-cols-2">
                            {currentLevel && currentLevel.id < LEVELS.length && (
                                <button 
                                    onClick={loadNextLevel}
                                    className="sm:col-span-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 text-xs uppercase tracking-widest flex items-center justify-center space-x-2"
                                >
                                    <i className="fas fa-play"></i>
                                    <span>Agla Level Shuru Karein! (Go to Level {currentLevel.id + 1})</span>
                                </button>
                            )}
                            
                            <button 
                                onClick={() => selectLevel(currentLevel)}
                                className="py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 active:scale-95 text-gray-700 dark:text-gray-200 font-extrabold rounded-2xl transition-all text-xs uppercase tracking-widest flex items-center justify-center space-x-2"
                            >
                                <i className="fas fa-undo"></i>
                                <span>Level Retry Karein</span>
                            </button>

                            <button 
                                onClick={backToMenu}
                                className="py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 active:scale-95 text-gray-700 dark:text-gray-200 font-extrabold rounded-2xl transition-all text-xs uppercase tracking-widest flex items-center justify-center space-x-2"
                            >
                                <i className="fas fa-home"></i>
                                <span>Main Menu Wapas</span>
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer branding */}
            <footer className="text-center mt-6 text-xs text-gray-500 dark:text-gray-500 font-medium flex items-center justify-center flex-wrap gap-1">
                <span>Designed with</span>
                <i className="fas fa-heart text-red-500 animate-pulse"></i>
                <span>by</span>
                <span className="font-extrabold text-indigo-500 dark:text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-0.5 cursor-pointer">
                    <i className="fas fa-user-shield text-[10px]"></i>
                    <span>Gaurav Pandey</span>
                </span>
                <span>for Indian English Learners.</span>
            </footer>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
