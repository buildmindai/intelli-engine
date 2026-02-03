import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Workspaces from "@/pages/Workspaces";
import CommandCenter from "@/pages/CommandCenter";
import DataSources from "@/pages/DataSources";
import Datasets from "@/pages/Datasets";
import Events from "@/pages/Events";
import AIAssistant from "@/pages/AIAssistant";
import Settings from "@/pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />

      {/* App routes */}
      <Route path="/app" component={Home} />
      <Route path="/app/workspaces" component={Workspaces} />

      <Route path="/app/workspaces/:workspaceId/command-center" component={CommandCenter} />
      <Route path="/app/workspaces/:workspaceId/data-sources" component={DataSources} />
      <Route path="/app/workspaces/:workspaceId/datasets" component={Datasets} />
      <Route path="/app/workspaces/:workspaceId/events" component={Events} />
      <Route path="/app/workspaces/:workspaceId/assistant" component={AIAssistant} />

      <Route path="/app/settings" component={Settings} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
