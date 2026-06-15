import { Form, useActionData, useNavigation, useSubmit } from "react-router";

import { Button } from "@shared/ui/button";
import { InputField } from "@shared/ui/input-field";
import { PasswordField } from "@shared/ui/password-field";
import { SectionHeading } from "@shared/ui/typography";

import type { AuthActionResult } from "./model/auth-action-result";
import { useAuthForm } from "./model/use-auth-form";
import type { AuthFormType } from "./model/use-auth-form";

export const AuthPage = () => {
  const actionData = useActionData<AuthActionResult>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isSubmitting = navigation.state === "submitting";

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useAuthForm();

  function submitAuthForm(values: AuthFormType) {
    const formData = new FormData();

    formData.set("email", values.email);
    formData.set("password", values.password);

    submit(formData, { method: "post" });
  }

  return (
    <main className="min-h-screen bg-[#f6f7f8] text-zinc-950">
      <section className="mx-auto  mt-8 w-full max-w-5xl gap-8 px-4 py-6 pb-24 sm:px-6 lg:px-8 grid rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <SectionHeading title="Авторизация" />

        <Form
          method="post"
          noValidate
          onSubmit={handleSubmit(submitAuthForm)}
          className="mx-auto flex w-full max-w-96 flex-col gap-4"
        >
          <InputField
            label="Email"
            type="email"
            placeholder="student@example.com"
            error={errors.email?.message}
            autoComplete="email"
            {...register("email")}
          />
          <PasswordField
            label="Пароль"
            placeholder="Введите ваш пароль"
            error={errors.password?.message}
            autoComplete="current-password"
            {...register("password")}
          />

          {actionData && (
            <div
              className={
                actionData.status === "success"
                  ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
                  : "rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800"
              }
            >
              {actionData.message}
              {actionData.status === "success" && (
                <span className="block text-xs font-normal">
                  {actionData.user.email}
                </span>
              )}
            </div>
          )}

          <Button type="submit" isLoading={isSubmitting}>
            Войти
          </Button>
        </Form>
      </section>
    </main>
  );
};
