import Link from "next/link";
import Image from "next/image";
import {useState} from "react";

import logo from "../../public/insignia-logo.svg";
import {useUserContext} from "@/contexts/UserContext";
import {logout} from "@/services/auth";
import {useRouter} from "next/router";

export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const {user} = useUserContext();
  const router = useRouter();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  if (user)
    return (
      <div>
        <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
          <div className="px-3 py-3 lg:px-5 lg:pl-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-start">
                <button
                  onClick={toggleSidebar}
                  aria-controls="logo-sidebar"
                  type="button"
                  className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <span className="sr-only">Abrir sidebar</span>
                  <svg
                    className="w-6 h-6"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clip-rule="evenodd"
                      fill-rule="evenodd"
                      d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                    ></path>
                  </svg>
                </button>
                <div className="inline-flex">
                  <Image width={35} height={35} src={logo} alt="Logo" />
                  <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-orange-500">
                    Insígnia
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex items-center ml-3">
                  <div>
                    <button
                      onClick={toggleUserMenu}
                      type="button"
                      className="flex text-sm rounded-full focus:ring-4 focus:ring-gray-300"
                      aria-expanded="false"
                    >
                      <span className="sr-only">Abrir menu do usuário</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                        />
                      </svg>
                    </button>
                  </div>
                  {isUserMenuOpen && (
                    <div className="z-50 absolute right-0 top-10 mt-2 py-2 min-w-48 max-w-96 text-base list-none bg-white divide-y divide-gray-100 border border-gray-200 rounded shadow-lg">
                      <div className="px-4 py-3" role="none">
                        <p className="text-sm text-gray-900">{user.name}</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.email}
                        </p>
                      </div>
                      <ul className="py-1" role="none">
                        <li>
                          <button
                            onClick={handleLogout}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 inline-flex w-full items-center text-orange-600"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4 mr-2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33"
                              />
                            </svg>
                            <span className="font-medium">Encerrar sessão</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        <aside
          id="logo-sidebar"
          className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } sm:translate-x-0 md:translate-x-0 lg:translate-x-0 bg-white border-r border-gray-200`}
          aria-label="Sidebar"
        >
          <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
            <ul className="space-y-2 font-medium">
              <li>
                <Link
                  href="/"
                  className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100"
                >
                  <span className="ml-3">Início</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/signatures"
                  className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100"
                >
                  <span className="ml-3">Assinaturas</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/documents/verify"
                  className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100"
                >
                  <span className="ml-3">Autenticar um documento</span>
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    );

  return <></>;
}
