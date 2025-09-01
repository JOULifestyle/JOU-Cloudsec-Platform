"use client";

import { Suspense } from "react";
import ResetPasswordPage from "./resetPasswordPage";

export default function ResetPage() {
  return (
    <Suspense fallback={<div>Loading reset page...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
