import React, { useState, useEffect, useRef } from 'react';
import { TripFormData } from '../types';
import { 
    Users, Calendar, Wallet, MapPin, Search, 
    Leaf, PersonStanding, Zap, Coffee, Camera, Mountain, 
    ShoppingBag, Landmark, Moon, Tent, ChevronLeft, ChevronRight,
    X, Info
} from 'lucide-react';

interface TripInputFormProps {
  onSubmit: (data: TripFormData) => void;
  isLoading: boolean;
}

const COMMON_DESTINATIONS = [
  "Australia",
  "New Zealand",
  "Tokyo, Japan",
  "Kyoto, Japan", 
  "Osaka, Japan",
  "Taipei, Taiwan",
  "Seoul, South Korea",
  "Bangkok, Thailand",
  "Singapore",
  "Paris, France",
  "London, UK",
  "New York, USA",
  "Rome, Italy"
];

const AGE_RANGES = [
    "Couple (25-35)",
    "Young Couple (18-25)",
    "Mature Couple (35-55)",
    "Family with Young Kids",
    "Family with Teens",
    "Group of Friends (20s)",
    "Solo Traveler",
    "Retirees"
];

const INTERESTS = [
    { id: 'food', label: 'Food & Dining', icon: Coffee },
    { id: 'culture', label: 'Culture & History', icon: Landmark },
    { id: 'nature', label: 'Nature', icon: Mountain },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'nightlife', label: 'Nightlife', icon: Moon },
    { id: 'photography', label: 'Photography', icon: Camera },
    { id: 'adventure', label: 'Adventure', icon: Tent },
];

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const TripInputForm: React.FC<TripInputFormProps> = ({ onSubmit, isLoading }) => {
  // --- Initialization with current month ---
  const today = new Date();
  const defaultStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);
  const defaultEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);

  // --- State ---
  const [destInput, setDestInput] = useState('');
  const [destinations, setDestinations] = useState<string[]>(['Japan']);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Travelers
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [ageRangeGroup, setAgeRangeGroup] = useState('Couple (25-35)');
  
  // Who is traveling (Checkboxes)
  const [hasChildrenCheck, setHasChildrenCheck] = useState(false);
  const [hasElderlyCheck, setHasElderlyCheck] = useState(false);

  // Vibe
  const [pace, setPace] = useState<'Relaxed' | 'Moderate' | 'Fast'>('Moderate');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Food & Dining', 'Culture & History']);

  // Budget
  const [minBudget, setMinBudget] = useState(20000);
  const [maxBudget, setMaxBudget] = useState(55000);

  // Dates & Duration
  const [duration, setDuration] = useState<number | ''>(10);
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [startDate, setStartDate] = useState<Date | null>(defaultStart);
  const [endDate, setEndDate] = useState<Date | null>(defaultEnd);

  // --- Effects ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setShowDestSuggestions(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => {
      if (startDate && endDate) {
          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          setDuration(diffDays);
      }
  }, [startDate, endDate]);

  // --- Handlers ---
  const addDestination = (dest: string) => {
    if (!destinations.includes(dest)) {
      setDestinations([...destinations, dest]);
    }
    setDestInput('');
    setShowDestSuggestions(false);
  };

  const removeDestination = (dest: string) => {
    setDestinations(destinations.filter(d => d !== dest));
  };

  const toggleInterest = (label: string) => {
    if (selectedInterests.includes(label)) {
        setSelectedInterests(selectedInterests.filter(i => i !== label));
    } else {
        setSelectedInterests([...selectedInterests, label]);
    }
  };

  const handleChildrenCountChange = (newCount: number) => {
      setChildrenCount(newCount);
      if (newCount > 0 && !hasChildrenCheck) {
          setHasChildrenCheck(true);
      } else if (newCount === 0 && hasChildrenCheck) {
          setHasChildrenCheck(false);
      }
  };

  // Calendar Logic
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const handleDateClick = (day: number) => {
      const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      if ((startDate && endDate) || (startDate && clickedDate < startDate)) {
          setStartDate(clickedDate);
          setEndDate(null);
      } else if (!startDate) {
          setStartDate(clickedDate);
      } else {
          setEndDate(clickedDate);
      }
  };

  const isDaySelected = (day: number) => {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      if (startDate && date.getTime() === startDate.getTime()) return true;
      if (endDate && date.getTime() === endDate.getTime()) return true;
      return false;
  };

  const isDayInRange = (day: number) => {
      if (!startDate || !endDate) return false;
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      return date > startDate && date < endDate;
  };

  const handleSubmit = () => {
    const totalTravelers = adults + childrenCount;
    let derivedAgeRange = ageRangeGroup;
    if (hasElderlyCheck) derivedAgeRange += " (includes Elderly)";
    if (hasChildrenCheck) derivedAgeRange += " (includes Children)";

    const preferencesString = `
      Pace: ${pace}.
      Interests: ${selectedInterests.join(', ')}.
      ${hasChildrenCheck ? 'Traveling with children.' : ''}
      ${hasElderlyCheck ? 'Traveling with elderly.' : ''}
    `;

    const dateRangeStr = startDate && endDate 
        ? `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
        : undefined;

    const formData: TripFormData = {
        destination: destinations.length > 0 ? destinations.join(', ') : "Anywhere",
        travelers: totalTravelers,
        duration: duration === '' ? 1 : duration,
        dateRange: dateRangeStr,
        ageRange: derivedAgeRange,
        budget: `${minBudget} - ${maxBudget} TWD`, 
        preferences: preferencesString.trim()
    };

    onSubmit(formData);
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const filteredDestSuggestions = COMMON_DESTINATIONS.filter(d => 
    d.toLowerCase().includes(destInput.toLowerCase()) && !destinations.includes(d)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* --- Left Column (2/3 width) --- */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Card: Where & When */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-brand-500" />
                <h3 className="font-bold text-white text-lg">Where & When</h3>
            </div>
            <div className="h-px bg-dark-700 mb-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Destination */}
                <div className="space-y-2 relative" ref={wrapperRef}>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Destination(s)</label>
                    <div className="relative flex items-center bg-dark-900 border border-dark-700 rounded-lg group focus-within:ring-1 focus-within:ring-brand-500">
                        <Search className="ml-3 w-4 h-4 text-slate-500" />
                        <input 
                            type="text" 
                            value={destInput}
                            onFocus={() => setShowDestSuggestions(true)}
                            onChange={(e) => setDestInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && destInput && addDestination(destInput)}
                            className="w-full bg-transparent py-3 px-2 text-white placeholder-slate-600 focus:outline-none"
                            placeholder="e.g. Japan"
                        />
                        {destInput && (
                          <button onClick={() => setDestInput('')} className="mr-3 text-slate-500 hover:text-white">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                    </div>
                    {showDestSuggestions && filteredDestSuggestions.length > 0 && (
                        <div className="absolute z-20 top-full mt-1 left-0 w-full bg-dark-800 border border-dark-600 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                            {filteredDestSuggestions.map((dest) => (
                                <button
                                    key={dest}
                                    type="button"
                                    onClick={() => addDestination(dest)}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-dark-700 hover:text-white transition-colors border-b border-dark-700/50 last:border-0"
                                >
                                    {dest}
                                </button>
                            ))}
                        </div>
                    )}
                    {/* Destination Chips */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {destinations.map(d => (
                        <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-900/30 border border-brand-500/50 text-brand-400 rounded-md text-xs font-bold">
                          {d}
                          <button onClick={() => removeDestination(d)} className="hover:text-white">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Duration</label>
                    <div className="relative flex items-center bg-dark-900 border border-dark-700 rounded-lg focus-within:ring-1 focus-within:ring-brand-500">
                        <Calendar className="ml-3 w-4 h-4 text-slate-500" />
                        <input 
                            type="number" 
                            min="1"
                            max="60"
                            value={duration}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') setDuration('');
                                else {
                                    setDuration(parseInt(val));
                                    setStartDate(null);
                                    setEndDate(null);
                                }
                            }}
                            className="w-full bg-transparent py-3 px-2 text-white placeholder-slate-600 focus:outline-none"
                        />
                        <span className="mr-4 text-sm text-slate-500 font-bold">Days</span>
                    </div>
                </div>
            </div>

            {/* Date Picker Section */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Select Dates</label>
                <div className="bg-dark-900/50 border border-dark-700 rounded-xl p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-dark-700 rounded-full text-slate-400 hover:text-white">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="font-bold text-white text-base">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-dark-700 rounded-full text-slate-400 hover:text-white">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-7 mb-2 text-center">
                    {DAYS_OF_WEEK.map((day, index) => (
                        <div key={`${day}-${index}`} className="text-xs font-bold text-slate-500 py-1">{day}</div>
                    ))}
                </div>

                    <div className="grid grid-cols-7 gap-y-1">
                        {days.map((day, idx) => {
                            if (!day) return <div key={idx} className="aspect-square" />;
                            
                            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                            const isStart = startDate && date.getTime() === startDate.getTime();
                            const isEnd = endDate && date.getTime() === endDate.getTime();
                            const inRange = isDayInRange(day);
                            const isSel = isStart || isEnd;

                            return (
                                <div key={idx} className={`relative aspect-square flex items-center justify-center ${inRange ? 'bg-[#0ea5e9]/10' : ''} ${isStart && endDate ? 'bg-[#0ea5e9]/10 rounded-l-lg' : ''} ${isEnd && startDate ? 'bg-[#0ea5e9]/10 rounded-r-lg' : ''}`}>
                                    <button
                                        type="button"
                                        onClick={() => handleDateClick(day)}
                                        className={`
                                            w-full h-full flex items-center justify-center text-sm font-bold transition-all relative z-10
                                            ${isSel ? 'bg-[#0ea5e9] text-white shadow-lg' : ''}
                                            ${isSel && isStart && endDate ? 'rounded-l-lg' : ''}
                                            ${isSel && isEnd && startDate ? 'rounded-r-lg' : ''}
                                            ${isSel && !startDate || !endDate ? 'rounded-lg' : ''}
                                            ${!isSel && inRange ? 'text-[#0ea5e9]' : 'text-slate-300'}
                                            ${!isSel && !inRange ? 'hover:bg-dark-700/50 rounded-lg' : ''}
                                        `}
                                    >
                                        {day}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>

        {/* Card: Trip Vibe & Interests */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
             <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-brand-500" />
                <h3 className="font-bold text-white text-lg">Trip Vibe & Interests</h3>
            </div>
            <div className="h-px bg-dark-700 mb-6" />

            <div className="mb-8">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 block">Pace Preference</label>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { val: 'Relaxed', icon: Leaf }, 
                        { val: 'Moderate', icon: PersonStanding }, 
                        { val: 'Fast', icon: Zap }
                    ].map((opt) => (
                        <button
                            key={opt.val}
                            onClick={() => setPace(opt.val as any)}
                            type="button"
                            className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
                                pace === opt.val 
                                ? 'bg-brand-900/20 border-brand-500 text-brand-400' 
                                : 'bg-dark-900 border-dark-700 text-slate-400 hover:border-slate-600 hover:bg-dark-800'
                            }`}
                        >
                            <opt.icon className={`w-5 h-5 mb-2 ${pace === opt.val ? 'text-brand-400' : 'text-slate-500'}`} />
                            <span className="text-sm font-bold">{opt.val}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 block">Interests</label>
                <div className="flex flex-wrap gap-2">
                    {INTERESTS.map((interest) => {
                        const isSelected = selectedInterests.includes(interest.label);
                        return (
                            <button
                                key={interest.id}
                                type="button"
                                onClick={() => toggleInterest(interest.label)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                                    isSelected
                                    ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                                    : 'bg-dark-900 border-dark-700 text-slate-400 hover:border-slate-500'
                                }`}
                            >
                                <interest.icon className="w-3.5 h-3.5" />
                                {interest.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>

      </div>

      {/* --- Right Column (1/3 width) --- */}
      <div className="space-y-6">
        
        {/* Card: Travelers */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-brand-500" />
                <h3 className="font-bold text-white text-lg">Travelers</h3>
            </div>
            <div className="h-px bg-dark-700 mb-6" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-bold text-white">Adults</div>
                        <div className="text-xs text-slate-500">Age 18+</div>
                    </div>
                    <div className="flex items-center bg-dark-900 rounded-lg border border-dark-700 overflow-hidden">
                        <button 
                            type="button"
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-dark-700 transition-colors"
                        >
                            -
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-white">{adults}</span>
                        <button 
                             type="button"
                             onClick={() => setAdults(Math.min(20, adults + 1))}
                             className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-dark-700 transition-colors"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-bold text-white">Children</div>
                        <div className="text-xs text-slate-500">Age 0-17</div>
                    </div>
                    <div className="flex items-center bg-dark-900 rounded-lg border border-dark-700 overflow-hidden">
                        <button 
                            type="button"
                            onClick={() => handleChildrenCountChange(Math.max(0, childrenCount - 1))}
                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-dark-700 transition-colors"
                        >
                            -
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-white">{childrenCount}</span>
                        <button 
                             type="button"
                             onClick={() => handleChildrenCountChange(Math.min(10, childrenCount + 1))}
                             className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-dark-700 transition-colors"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Age Range / Group Type</label>
                    <select 
                        value={ageRangeGroup}
                        onChange={(e) => setAgeRangeGroup(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-700 rounded-lg py-3 px-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                        {AGE_RANGES.map(range => (
                            <option key={range} value={range}>{range}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        {/* Card: Who is traveling? */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-brand-500" />
                <h3 className="font-bold text-white text-lg">Who is traveling?</h3>
            </div>
            <div className="h-px bg-dark-700 mb-6" />
            
            <div className="space-y-4">
                 <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        checked={hasChildrenCheck} 
                        onChange={(e) => setHasChildrenCheck(e.target.checked)}
                        className="w-5 h-5 rounded bg-dark-900 border border-dark-600 text-brand-500 focus:ring-offset-dark-800 transition-all cursor-pointer"
                    />
                    <span className="text-slate-200 text-sm font-bold group-hover:text-white">Children in group</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        checked={hasElderlyCheck} 
                        onChange={(e) => setHasElderlyCheck(e.target.checked)}
                        className="w-5 h-5 rounded bg-dark-900 border border-dark-600 text-brand-500 focus:ring-offset-dark-800 transition-all cursor-pointer"
                    />
                    <span className="text-slate-200 text-sm font-bold group-hover:text-white">Elderly in group</span>
                </label>
            </div>
        </div>

        {/* Card: Budget */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
             <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5 text-brand-500" />
                <h3 className="font-bold text-white text-lg">Total Budget</h3>
            </div>
            <div className="h-px bg-dark-700 mb-6" />
            
            <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                    <div className="text-center">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">MIN</div>
                        <div className="text-xl font-bold text-white">${minBudget.toLocaleString()}</div>
                    </div>
                    <div className="w-8 h-px bg-dark-600" />
                    <div className="text-center">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">MAX</div>
                        <div className="text-xl font-bold text-white">${maxBudget.toLocaleString()}</div>
                    </div>
                </div>
                
                <div className="relative h-6 flex items-center">
                    <div className="absolute w-full h-1.5 bg-dark-700 rounded-full" />
                    <div 
                        className="absolute h-1.5 bg-brand-500 rounded-full"
                        style={{
                            left: `${(minBudget / 300000) * 100}%`,
                            right: `${100 - (maxBudget / 300000) * 100}%`
                        }}
                    />
                    <input 
                        type="range"
                        min="10000"
                        max="300000"
                        step="5000"
                        value={minBudget}
                        onChange={(e) => setMinBudget(Math.min(Number(e.target.value), maxBudget - 5000))}
                        className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-brand-500"
                    />
                    <input 
                        type="range"
                        min="10000"
                        max="300000"
                        step="5000"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(Math.max(Number(e.target.value), minBudget + 5000))}
                        className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-brand-500"
                    />
                </div>

                <div className="bg-dark-900/80 border border-brand-500/10 rounded-lg p-3 flex items-start gap-3">
                    <Info className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Estimate includes flights, hotels, and daily expenses.
                    </p>
                </div>
            </div>
        </div>

      </div>

      {/* --- Footer / Bottom Action --- */}
      <div className="lg:col-span-3 mt-8 pt-8 border-t border-dark-700 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
                <h4 className="text-white font-bold text-lg">Ready to generate?</h4>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">3 steps completed</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <button 
                    type="button" 
                    className="px-8 py-3 rounded-lg border border-dark-600 text-slate-300 font-bold hover:text-white hover:border-slate-500 hover:bg-dark-800 transition-all w-full md:w-auto"
                >
                    Save Draft
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`
                        flex items-center justify-center gap-2 px-10 py-3 rounded-lg font-black text-white shadow-xl shadow-brand-500/10 w-full md:w-auto
                        ${isLoading 
                            ? 'bg-slate-700 cursor-not-allowed opacity-50' 
                            : 'bg-brand-500 hover:bg-brand-400 active:scale-95 transition-all'
                        }
                    `}
                >
                    {isLoading ? (
                        <>
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                         <span>Generating...</span>
                        </>
                    ) : (
                        <>
                            <Zap className="w-4 h-4 fill-white" />
                            <span>Generate Plan</span>
                        </>
                    )}
                </button>
            </div>
      </div>
    </div>
  );
};

export default TripInputForm;