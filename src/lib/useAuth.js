import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";

export function useAuth(redirectIfNoUser = true) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);

      if (redirectIfNoUser && !data?.user && location.pathname !== "/auth") {
        navigate("/auth");
      }
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (!currentUser && redirectIfNoUser) navigate("/auth");
    });

    return () => listener.subscription.unsubscribe();
  }, [navigate, redirectIfNoUser, location.pathname]);

  return { user, loading };
}
