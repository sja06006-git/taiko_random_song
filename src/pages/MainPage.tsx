import { Link } from 'react-router-dom';

export function MainPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 md:p-4 text-center min-h-screen box-border flex flex-col items-center justify-center">
      <header className="mb-12">
        <h1 className="text-6xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 mb-6">
          Taiko Songs Entertainment
        </h1>
        <p className="text-xl text-gray-400">
          Pick a song, challenge yourself!
        </p>
      </header>

      <main className="flex flex-col gap-6 w-full max-w-md">
        <Link 
          to="/random" 
          className="group relative px-8 py-5 bg-zinc-800 rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 border border-zinc-700 hover:border-red-500"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-between">
            <span className="text-xl font-bold text-gray-200 group-hover:text-white">Random Picker</span>
            <span className="text-2xl">🎲</span>
          </div>
        </Link>
        
        <Link 
          to="/quiz" 
          className="group relative px-8 py-5 bg-zinc-800 rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 border border-zinc-700 hover:border-purple-500"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-between">
            <span className="text-xl font-bold text-gray-200 group-hover:text-white">Music Quiz</span>
            <span className="text-2xl">📝</span>
          </div>
        </Link>
      </main>
    </div>
  );
}
