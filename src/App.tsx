import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { App as CapApp } from '@capacitor/app';
import Home from "./pages/Home";
import Search from "./pages/Search";
import TemplateDetail from "./pages/TemplateDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle back button navigation
const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let listenerHandle: any;

    const setupListener = async () => {
      listenerHandle = await CapApp.addListener('backButton', ({ canGoBack }) => {
        // If we're on the home page, exit the app
        if (location.pathname === '/') {
          CapApp.exitApp();
        } else if (location.pathname.startsWith('/template/')) {
          // For template detail pages, check if there's a 'from' parameter
          const searchParams = new URLSearchParams(location.search);
          const fromPath = searchParams.get('from');
          if (fromPath) {
            navigate(fromPath);
          } else {
            navigate('/');
          }
        } else {
          // For other pages, navigate back in history
          navigate(-1);
        }
      });
    };

    setupListener();

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [navigate, location.pathname, location.search]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <BackButtonHandler />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/template/:id" element={<TemplateDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
