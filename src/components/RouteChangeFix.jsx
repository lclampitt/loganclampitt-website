import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function RouteChangeFix() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Blur anything that was clicked
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }

    // Temporarily disable interactions during route swap
    document.documentElement.classList.add("route-changing");

    const timeout = setTimeout(() => {
      document.documentElement.classList.remove("route-changing");
    }, 200);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}
