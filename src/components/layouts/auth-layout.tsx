import { Outlet, Link } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Côté gauche - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12 bg-gradient-to-br from-primary/20 via-primary to-background">
        <div className="max-w-md">
          <Link to="/" className="flex items-center space-x-2 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-bold text-xl">L</span>
            </div>
            <span className="font-bold text-2xl">Latodo</span>
          </Link>

          <h1 className="text-4xl font-bold tracking-tight mb-6">
            Gérez vos tâches comme un pro
          </h1>

          <p className="text-lg text-muted-foreground mb-8 text-white/90">
            Collaborez avec votre équipe, suivez votre progression et livrez vos
            projets à temps. Une solution moderne pour une productivité
            optimale.
          </p>

          <ul className="space-y-4 text-sm text-muted-foreground text-white/80">
            <li className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-white rounded-full" />
              <span>Collaboration en temps réel</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-white rounded-full" />
              <span>Téléchargement et pièces jointes</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-white rounded-full" />
              <span>Filtrage et recherche avancés</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Côté droit - Formulaires d'authentification */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
