"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import SwitcherTheme from "@/components/SwitcherTheme";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import service from "./services/authenticator.service";
import { LoginBody, LoginResponse } from "./types/types";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const body: LoginBody = {
      login: (e.currentTarget.elements.namedItem("email") as HTMLInputElement)
        .value,
      password: (
        e.currentTarget.elements.namedItem("password") as HTMLInputElement
      ).value,
    };

    service
      .post<LoginBody, LoginResponse>(body)
      .then((response) => {
        Cookies.set("Token", response.data.Token);
        Cookies.set("RefreshToken", response.data.RefreshToken);
        
        // Redirecionar para o dashboard após login bem-sucedido
        router.push("/dashboard");
      })
      .catch((err: any) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <>
      <div className="absolute top-4 right-4">
        <SwitcherTheme />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Fast Finance</CardTitle>
          <CardDescription>Faça login para continuar</CardDescription>
        </CardHeader>

        <CardContent>
          <form className="grid gap-6" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground"
                >
                  Lembrar de mim
                </Label>
              </div>
              <Link
                href="/register"
                className="text-sm text-primary hover:underline"
              >
                Criar conta
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
