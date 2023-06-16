import Image from "next/image";
import {useState} from "react";

import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import LandingImage from "../../../public/landing-image.svg";
import Logo from "../../../public/insignia-logo.svg";
export default function AuthPage() {
  const [showRegisterForm, setShowRegisterForm] = useState(true);

  const toggleRegisterForm = () => {
    setShowRegisterForm((flag) => !flag);
  };

  return (
    <div className="flex px-6 sm:px-16 py-16 w-full h-full flex-col items-center justify-around mx-auto">
      <div className="text-center flex flex-col items-center justify-center">
        <div className="inline-flex">
          <Image width={64} height={64} src={Logo} alt="Logo" />
          <span className="text-4xl font-semibold sm:text-6xl whitespace-nowrap text-orange-500">
            Insígnia
          </span>
        </div>
        <p className="text-2xl font-semibold text-slate-600">
          Um serviço de assinaturas digitais simples e seguro
        </p>
        <p className="text-xl text-slate-500 w-2/3">
          Faça o upload dos seus documentos, convide usuários para assiná-los e
          garanta autenticidade e integridade de forma descentralizada através
          da blockchain
        </p>
      </div>

      <div className="mt-16 w-full h-4/5 flex flex-col md:flex-row justify-evenly items-center">
        <div className="hidden sm:flex w-3/5 h-full flex flex-col justify-between items-center gap-16">
          <Image src={LandingImage} width={400} alt="Figura" />
        </div>

        {showRegisterForm ? (
          <RegisterForm toggleForm={toggleRegisterForm} />
        ) : (
          <LoginForm toggleForm={toggleRegisterForm}></LoginForm>
        )}
      </div>
    </div>
  );
}
