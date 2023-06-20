import {useRouter} from "next/router";
import {toast} from "react-toastify";
import {z} from "zod";

import api from "@/services/api";
import {login} from "@/services/auth";

export default function LoginForm({toggleForm}: {toggleForm: () => void}) {
  const router = useRouter();

  const formSchema = z.object({
    email: z
      .string()
      .email("Email inválido")
      .min(1, "Por favor preencha o email"),
    password: z.string().min(1, "Por favor preencha a senha"),
  });

  type formBody = z.infer<typeof formSchema>;

  const handleOnSubmit = async (event: any) => {
    event.preventDefault();

    const data: formBody = {
      email: event.target.email.value,
      password: event.target.password.value,
    };

    try {
      formSchema.parse(data);
    } catch (err) {
      let message = "Formulário inválido";
      if (err instanceof z.ZodError) {
        const firstError: any = Object.values(err.format()).pop();
        message = firstError?._errors.pop() || message;
      }
      toast.error(message);

      return;
    }

    api
      .post("/user/login", data)
      .then((response) => {
        toast.success(`Bem vindo (a), ${response.data.user.name}`);
        login(response.data.token, data.email, response.data.user.id);
        router.push("/");
      })
      .catch((err) => {
        const message =
          err.response?.data?.message ||
          "Ocorreu um erro ao acessar o servidor";

        toast.warning(message);
      });
  };

  return (
    <section className="w-[300px] sm:w-[500px]">
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl">
            Entre na sua conta
          </h1>
          <form className="space-y-4 md:space-y-6" onSubmit={handleOnSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-slate-700"
              >
                Seu email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="bg-slate-100 border border-gray-300 text-slate-700 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder="nome@dominio.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-slate-700"
              >
                Sua senha
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                placeholder="••••••••"
                className="bg-slate-100 border border-gray-300 text-slate-700 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              />
            </div>
            <button
              type="submit"
              className="w-full text-white bg-orange-400 focus:ring-2 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Entrar
            </button>
            <p className="text-sm text-gray-500">
              Não tem uma conta?{" "}
              <button
                onClick={toggleForm}
                type="submit"
                className="font-medium text-orange-500 hover:underline"
              >
                Crie uma conta
              </button>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
