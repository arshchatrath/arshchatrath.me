import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import NotFound from "@/pages/not-found";
import Portfolio from "@/pages/Portfolio";
import Resume from "@/pages/Resume";
import Figma from "@/pages/Figma";
import Cursor from "@/components/Cursor";
import RouteTransition from "@/components/RouteTransition";
import Neko from "@/components/Neko";

// The WebGL background (and OGL) loads as its own chunk after first paint.
const AmbientField = lazy(() => import("@/gl/AmbientField"));

function Router() {
  // resume.<domain> serves the resume as its own landing page.
  const isResumeHost =
    typeof window !== "undefined" &&
    window.location.hostname.startsWith("resume.");

  return (
    <Switch>
      <Route path="/resume" component={Resume} />
      <Route path="/figma" component={Figma} />
      <Route path="/" component={isResumeHost ? Resume : Portfolio} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      {/* One canvas for the whole session — it outlives every route change. */}
      <Suspense fallback={null}>
        <AmbientField />
      </Suspense>
      <div className="relative z-10">
        <Router />
      </div>
      <Neko />
      <Cursor />
      <RouteTransition />
    </WouterRouter>
  );
}
