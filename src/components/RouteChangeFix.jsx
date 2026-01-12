import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function RouteChangeFix() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }

    document.documentElement.classList.add("route-changing");

    const t = setTimeout(() => {
      document.documentElement.classList.remove("route-changing");
    }, 180);

    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
