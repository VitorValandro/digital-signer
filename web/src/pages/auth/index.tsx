import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import {useState} from "react";

export default function AuthPage() {
  const [showRegisterForm, setShowRegisterForm] = useState(true);

  const toggleRegisterForm = () => {
    setShowRegisterForm((flag) => !flag);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      {showRegisterForm ? (
        <RegisterForm toggleForm={toggleRegisterForm} />
      ) : (
        <LoginForm toggleForm={toggleRegisterForm}></LoginForm>
      )}
    </div>
  );
}
