"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { routes, protectedRoutes } from "@/resources";
import { Flex, Spinner, Heading, Column } from "@once-ui-system/core";
import NotFound from "@/app/not-found";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const [isRouteEnabled, setIsRouteEnabled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performChecks = async () => {
      setLoading(true);
      setIsRouteEnabled(false);
      setIsAuthenticated(false);

      const checkRouteEnabled = () => {
        if (!pathname) return false;

        if (pathname in routes) {
          return routes[pathname as keyof typeof routes];
        }

        const dynamicRoutes = ["/blog", "/work"] as const;
        for (const route of dynamicRoutes) {
          if (pathname?.startsWith(route) && routes[route]) {
            return true;
          }
        }

        return false;
      };

      const routeEnabled = checkRouteEnabled();
      setIsRouteEnabled(routeEnabled);

      if (protectedRoutes[pathname as keyof typeof protectedRoutes]) {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('permission_level')
            .eq('id', session.user.id)
            .single();

          if (profile && profile.permission_level >= 30) {
            setIsAuthenticated(true);
          } else {
            setAuthError("권한이 부족합니다. (Permission Level 30 이상 필요)");
            await supabase.auth.signOut();
          }
        }
      }

      setLoading(false);
    };

    performChecks();
  }, [pathname]);

  const handleMoringLogin = () => {
    const loginUrl = new URL("https://account.moring.co/auth/login");
    const fullNextUrl = `${window.location.origin}${pathname}`;
    loginUrl.searchParams.set("next", encodeURIComponent(fullNextUrl));
    window.location.href = loginUrl.toString();
  };

  if (loading) {
    return (
      <Flex fillWidth paddingY="128" horizontal="center">
        <Spinner />
      </Flex>
    );
  }

  if (!isRouteEnabled) {
    return <NotFound />;
  }

  if (!isAuthenticated && protectedRoutes[pathname as keyof typeof protectedRoutes]) {
    return (
      <Column paddingY="128" maxWidth={24} gap="24" center>
        <style>{`
          .moring-login-btn {
            width: 240px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 14px 20px;
            background-color: #F2F4F6;
            color: #191F28;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            border: none;
            transition: background-color 0.2s ease;
            cursor: pointer;
            outline: none;
          }
          .moring-login-btn:hover {
            background-color: #E5E8EB;
          }
          .moring-login-btn:active {
            background-color: #D1D6DB;
          }
        `}</style>
        <Heading align="center" wrap="balance">
          Moring Auth Required
        </Heading>
        <Column fillWidth gap="8" horizontal="center">
          {authError && (
            <div style={{ color: 'var(--danger-on-background-medium)', fontSize: '14px', marginBottom: '8px' }}>
              {authError}
            </div>
          )}
          <button
            onClick={handleMoringLogin}
            className="moring-login-btn"
          >
            <Image
              src="/icons/moring.svg"
              alt="Moring"
              width={22}
              height={22}
              className="mr-2.5"
              style={{ marginRight: '10px' }}
            />
            <span>Moring 로그인</span>
          </button>
        </Column>
      </Column>
    );
  }

  return <>{children}</>;
};

export { RouteGuard };
