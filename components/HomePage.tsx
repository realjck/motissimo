
import React, { useState } from 'react';
import type { CrosswordData } from '../types';
import ConfirmationModal from './ConfirmationModal';
import SoundToggle from './SoundToggle';

interface HomePageProps {
  onSelectGrid: (data: CrosswordData) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const GRID_CATEGORIES = [
  {
    title: 'Nature et Environnement',
    image: 'assets/images/nature-environnement.jpg',
    grids: [
      { name: 'Astronomie', file: 'motissimo-grille-astronomie.json' },
      { name: 'Botanique', file: 'motissimo-grille-botanique.json' },
      { name: 'Météo', file: 'motissimo-grille-meteo.json' },
      { name: 'Océanographie', file: 'motissimo-grille-oceanographie.json' },
      { name: 'Volcans', file: 'motissimo-grille-volcans.json' },
      { name: 'Déserts', file: 'motissimo-grille-deserts.json' },
      { name: 'Forêts', file: 'motissimo-grille-forets.json' },
      { name: 'Fleurs', file: 'motissimo-grille-fleurs.json' },
      { name: 'Minéraux', file: 'motissimo-grille-mineraux.json' },
      { name: 'Écologie', file: 'motissimo-grille-ecologie.json' },
    ]
  },
  {
    title: 'Animaux',
    image: 'assets/images/animaux.jpg',
    grids: [
      { name: 'Mammifères', file: 'motissimo-grille-mammiferes.json' },
      { name: 'Oiseaux', file: 'motissimo-grille-oiseaux.json' },
      { name: 'Insectes', file: 'motissimo-grille-insectes.json' },
      { name: 'Reptiles', file: 'motissimo-grille-reptiles.json' },
      { name: 'Animaux marins', file: 'motissimo-grille-animaux-marins.json' },
      { name: 'Animaux de la ferme', file: 'motissimo-grille-animaux-de-la-ferme.json' },
      { name: 'Félins', file: 'motissimo-grille-felins.json' },
      { name: 'Dinosaures', file: 'motissimo-grille-dinosaures.json' },
    ]
  },
  {
    title: 'Loisirs et Culture',
    image: 'assets/images/loisirs-culture.jpg',
    grids: [
      { name: 'Cinéma', file: 'motissimo-grille-cinema.json' },
      { name: 'Musique', file: 'motissimo-grille-musique.json' },
      { name: 'Littérature', file: 'motissimo-grille-litterature.json' },
      { name: 'Peinture', file: 'motissimo-grille-peinture.json' },
      { name: 'Photographie', file: 'motissimo-grille-photographie.json' },
      { name: 'Théâtre', file: 'motissimo-grille-theatre.json' },
      { name: 'Sculpture', file: 'motissimo-grille-sculpture.json' },
      { name: 'Danse', file: 'motissimo-grille-danse.json' },
      { name: 'Bande dessinée', file: 'motissimo-grille-bande-dessinee.json' },
      { name: 'Jeux vidéo', file: 'motissimo-grille-jeux-video.json' },
    ]
  },
  {
    title: 'Sciences et Technologie',
    image: 'assets/images/sciences-technologies.jpg',
    grids: [
      { name: 'Informatique', file: 'motissimo-grille-informatique.json' },
      { name: 'Mathématiques', file: 'motissimo-grille-mathematiques.json' },
      { name: 'Physique', file: 'motissimo-grille-physique.json' },
      { name: 'Chimie', file: 'motissimo-grille-chimie.json' },
      { name: 'Médecine', file: 'motissimo-grille-medecine.json' },
      { name: 'Architecture', file: 'motissimo-grille-architecture.json' },
      { name: 'Espace', file: 'motissimo-grille-espace.json' },
      { name: 'Électricité', file: 'motissimo-grille-electricite.json' },
      { name: 'Robotique', file: 'motissimo-grille-robotique.json' },
      { name: 'Internet', file: 'motissimo-grille-internet.json' },
    ]
  },
  {
    title: 'Vie Quotidienne',
    image: 'assets/images/vie-quotidienne.jpg',
    grids: [
      { name: 'Cuisine', file: 'motissimo-grille-cuisine.json' },
      { name: 'Jardinage', file: 'motissimo-grille-jardinage.json' },
      { name: 'Bricolage', file: 'motissimo-grille-bricolage.json' },
      { name: 'Mode', file: 'motissimo-grille-mode.json' },
      { name: 'Mobilier', file: 'motissimo-grille-mobilier.json' },
      { name: 'Outillage', file: 'motissimo-grille-outillage.json' },
      { name: 'Textile', file: 'motissimo-grille-textile.json' },
      { name: 'Maquillage', file: 'motissimo-grille-maquillage.json' },
      { name: 'Horlogerie', file: 'motissimo-grille-horlogerie.json' },
      { name: 'École', file: 'motissimo-grille-ecole.json' },
    ]
  },
  {
    title: 'Sports et Transports',
    image: 'assets/images/sports-transports.jpg',
    grids: [
      { name: 'Football', file: 'motissimo-grille-football.json' },
      { name: 'Tennis', file: 'motissimo-grille-tennis.json' },
      { name: 'Cyclisme', file: 'motissimo-grille-cyclisme.json' },
      { name: 'Natation', file: 'motissimo-grille-natation.json' },
      { name: 'Équitation', file: 'motissimo-grille-equitation.json' },
      { name: 'Aviation', file: 'motissimo-grille-aviation.json' },
      { name: 'Automobile', file: 'motissimo-grille-automobile.json' },
      { name: 'Navigation', file: 'motissimo-grille-navigation.json' },
      { name: 'Alpinisme', file: 'motissimo-grille-alpinisme.json' },
      { name: 'Arts martiaux', file: 'motissimo-grille-arts-martiaux.json' },
    ]
  },
  {
    title: 'Histoire et Société',
    image: 'assets/images/histoire-societes.jpg',
    grids: [
      { name: 'Mythologie', file: 'motissimo-grille-mythologie.json' },
      { name: 'Moyen Âge', file: 'motissimo-grille-moyen-age.json' },
      { name: 'Antiquité', file: 'motissimo-grille-antiquite.json' },
      { name: 'Révolution', file: 'motissimo-grille-revolution.json' },
      { name: 'Politique', file: 'motissimo-grille-politique.json' },
      { name: 'Économie', file: 'motissimo-grille-economie.json' },
      { name: 'Religions', file: 'motissimo-grille-religions.json' },
      { name: 'Philosophie', file: 'motissimo-grille-philosophie.json' },
      { name: 'Justice', file: 'motissimo-grille-justice.json' },
      { name: 'Armée', file: 'motissimo-grille-armee.json' },
    ]
  },
  {
    title: 'Géographie et Voyages',
    image: 'assets/images/geographie-voyages.jpg',
    grids: [
      { name: 'Capitales', file: 'motissimo-grille-capitales.json' },
      { name: 'Montagnes', file: 'motissimo-grille-montagnes.json' },
      { name: 'Fleuves', file: 'motissimo-grille-fleuves.json' },
      { name: 'Europe', file: 'motissimo-grille-europe.json' },
      { name: 'Afrique', file: 'motissimo-grille-afrique.json' },
      { name: 'Asie', file: 'motissimo-grille-asie.json' },
      { name: 'Amérique', file: 'motissimo-grille-amerique.json' },
      { name: 'Océanie', file: 'motissimo-grille-oceanie.json' },
      { name: 'Camping', file: 'motissimo-grille-camping.json' },
      { name: 'Tourisme', file: 'motissimo-grille-tourisme.json' },
      { name: 'Cartographie', file: 'motissimo-grille-cartographie.json' },
      { name: 'Gastronomie', file: 'motissimo-grille-gastronomie.json' },
    ]
  }
];

interface HomePageProps {
  onSelectGrid: (data: CrosswordData) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  completedGrids: string[];
  inProgressGrids: string[];
  onClearProgress: () => void;
}

const ImageWithLoader: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

const HomePage: React.FC<HomePageProps> = ({ onSelectGrid, theme, onToggleTheme, completedGrids, inProgressGrids, onClearProgress }) => {
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleGridClick = async (file: string, name: string, categoryImage: string) => {
    setLoadingFile(file);
    try {
      const response = await fetch(`assets/grilles/${file}`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la grille');
      }
      const data = await response.json();
      onSelectGrid({ ...data, theme: name, categoryImage, id: file }); // Pass 'file' as ID
    } catch (error) {
      console.error('Erreur:', error);
      alert("Impossible de charger cette grille. Veuillez réessayer.");
    } finally {
      setLoadingFile(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-950 bg-gradient-to-br from-blue-100 via-white to-teal-100 dark:from-gray-900 dark:via-gray-900/90 dark:to-blue-800/30 overflow-x-hidden transition-colors duration-300">

      {/* Background decoration */}

      <div className="fixed top-0 right-0 p-6 z-50 flex gap-4">
        <SoundToggle className="p-3 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-md text-slate-800 dark:text-yellow-400 shadow-lg border-2 border-gray-600/20 dark:border-gray-600/30 transition-all hover:scale-110 active:scale-95" />
        <button
          onClick={onToggleTheme}
          className="p-3 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-md text-slate-800 dark:text-yellow-400 shadow-lg border-2 border-gray-600/20 dark:border-gray-600/30 transition-all hover:scale-110 active:scale-95"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7V3m0 14v4m-5-9H3m14 0h4M7.05 7.05L4.93 4.93m12.12 12.12l2.12 2.12M16.95 7.05l2.12-2.12M7.05 16.95l-2.12 2.12M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
      </div>

      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-[100px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-400/10 dark:bg-teal-600/5 rounded-full blur-[100px] -z-10 animate-pulse-slow delay-1000" />

      <main className="container mx-auto px-4 py-8 md:py-16 relative z-10">

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 mb-16 md:mb-24 max-w-6xl mx-auto">
          <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 shrink-0">
            <ImageWithLoader
              src="assets/images/motissimo_illustration.png"
              alt="Motissimo Illustration"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex-grow space-y-4 md:space-y-6 text-center lg:text-left max-w-2xl">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-bold tracking-wider uppercase">
              Mots Fléchés
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-teal-500 dark:from-blue-400 dark:to-teal-300 drop-shadow-sm">
              Motissimo<span className="text-2xl md:text-3xl lg:text-4xl">.pxly.fr</span>
            </h1>

            <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Une collection de mots fléchés en 8 catégories thématiques. 80 grilles conçues pour mettre votre logique au défi et tester votre culture générale.
            </p>
            <p className="text-lg md:text-1xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Votre progression est enregistrée automatiquement. Dès qu'une grille est complétée, elle apparaît comme cochée dans votre liste. À vous de jouer !
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {GRID_CATEGORIES.map((category, index) => (
            <section key={category.title} className="flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {category.title}
                </h2>
              </div>

              {/* Category Illustration */}
              <div className="mb-8 w-full h-48 rounded-2xl overflow-hidden relative group">
                <ImageWithLoader
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {category.grids.map((grid) => (
                  <button
                    key={grid.name}
                    onClick={() => handleGridClick(grid.file, grid.name, category.image)}
                    disabled={loadingFile === grid.file || !!loadingFile}
                    className="group relative bg-white dark:bg-gray-800 p-3.5 rounded-xl shadow-sm hover:shadow-xl border border-slate-100 dark:border-gray-700/50 transition-all duration-300 hover:border-blue-500 border-2 overflow-hidden text-left w-full active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/10 dark:to-teal-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10 flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300 truncate flex-1 min-w-0">
                        {grid.name}
                      </span>
                      {loadingFile === grid.file ? (
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${completedGrids.includes(grid.file)
                          ? 'bg-green-500 border-green-500 scale-110'
                          : inProgressGrids.includes(grid.file)
                            ? 'border-blue-400 dark:border-blue-400'
                            : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-400 dark:group-hover:border-blue-400 group-hover:scale-110'
                          }`}>
                          {completedGrids.includes(grid.file) ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : inProgressGrids.includes(grid.file) ? (
                            <div className="flex gap-0.5">
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Footer with Clear Progress */}
      {completedGrids.length > 0 && (
        <footer className="container mx-auto px-4 py-8 mb-8 border-t border-slate-200 dark:border-slate-800 flex justify-center">
          <button
            onClick={() => setIsConfirmModalOpen(true)}
            className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Effacer ma progression
          </button>
        </footer>
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={onClearProgress}
        title="Effacer ma progression"
        message="Attention, cela effacera toute votre progression (grilles terminées et en cours). Êtes-vous sûr ?"
        confirmLabel="Effacer"
        isDestructive={true}
      />

      <footer className="w-full text-center py-8 text-slate-400 dark:text-slate-600 text-sm border-t border-slate-200 dark:border-slate-800 mt-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <p>Imaginé et réalisé par <a href="https://pxly.fr" target="_blank" rel="noopener noreferrer">pxly.fr</a> avec plusieurs outils d'intelligence artificielle générative.</p>
      </footer>
    </div>
  );
};

export default HomePage;
