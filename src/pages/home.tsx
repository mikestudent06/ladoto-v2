import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Users, Zap } from "lucide-react";

export function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Section héro */}
      <section className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Gestion de tâches pour{" "}
            <span className="text-primary">équipes modernes</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Optimisez votre flux de travail, collaborez efficacement et livrez
            vos projets à temps. Une solution moderne pour une productivité
            maximale.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/auth/register">
              <Button size="lg" className="flex items-center">
                Commencer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="lg">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section fonctionnalités */}
      <section className="px-6 py-24 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Tout ce dont vous avez besoin pour gérer vos tâches
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Une solution complète et intuitive pour votre productivité
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg border">
              <CheckCircle className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Gestion intelligente des tâches
              </h3>
              <p className="text-muted-foreground">
                Créez, assignez et suivez vos tâches avec des fonctionnalités
                avancées de filtrage et de recherche.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Collaboration d'équipe
              </h3>
              <p className="text-muted-foreground">
                Travaillez ensemble efficacement avec des mises à jour en temps
                réel et le partage de fichiers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <Zap className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Interface moderne</h3>
              <p className="text-muted-foreground">
                Une interface utilisateur intuitive et responsive conçue pour
                une expérience utilisateur optimale.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
