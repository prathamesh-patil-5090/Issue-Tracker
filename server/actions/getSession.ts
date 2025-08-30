"use server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { Session } from "next-auth";

export const getSession = async (): Promise<Session | null> => {
  const session = await getServerSession(authConfig);

  return session;
};
