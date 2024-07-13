"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-dropdown-menu";
import { useAtom } from "jotai/react";
import { useState } from "react";

import { userIdAtom } from "./state/userId";

export function Auth(props: any) {
  const [userId, setUserId] = useAtom(userIdAtom);
  const [input, setInput] = useState("");

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-md p-6 sm:p-8">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold">zkard</CardTitle>
            <CardDescription>
              Demo account, enter any user ID to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input
                onChange={(event) => {
                  setInput((event.target as HTMLInputElement).value);
                }}
                id="userId"
                type="text"
                placeholder="Enter your user ID"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => {
                setUserId(input);
              }}
              disabled={!input}
              type="submit"
              className="w-full"
            >
              Enter!
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  return <>{props.children}</>;
}
