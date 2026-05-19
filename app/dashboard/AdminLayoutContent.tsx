"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";

import { Modal } from "@/components/ui/modal";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";

import DocsIcon from "@/icons/docs.svg";
import ChevronDownIcon from "@/icons/chevron-down.svg";
import GridIcon from "@/icons/grid.svg";
import HorizontaLDots from "@/icons/horizontal-dots.svg";
import PieChartIcon from "@/icons/pie-chart.svg";
import UserCircleIcon from "@/icons/user-circle.svg";
import NavigationIcon from "@/icons/navigation.svg";
import MoreDotIcon from "@/icons/more-dot.svg";

type Account = {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  type: "Personal" | "Business";
  isMalaysian: boolean;
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  { icon: <GridIcon />, name: "Dashboard", path: "/dashboard" },
  { icon: <UserCircleIcon />, name: "Add Account", path: "#" },
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart", pro: false },
      { name: "Bar Chart", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <DocsIcon />,
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts", pro: false },
      { name: "Avatar", path: "/avatars", pro: false },
      { name: "Badge", path: "/badge", pro: false },
      { name: "Buttons", path: "/buttons", pro: false },
      { name: "Images", path: "/images", pro: false },
      { name: "Videos", path: "/videos", pro: false },
    ],
  },
];

const checkActive = (path: string, pathname: string) => path === pathname;

const getInitialOpenSubmenu = (pathname: string): { type: "main" | "others"; index: number } | null => {
  let newOpenSubmenu: { type: "main" | "others"; index: number } | null = null;
  let submenuMatched = false;

  ["main", "others"].forEach((menuType) => {
    if (submenuMatched) return;

    const items = menuType === "main" ? navItems : othersItems;

    items.forEach((nav, index) => {
      if (nav.subItems) {
        const found = nav.subItems.some((subItem) => checkActive(subItem.path, pathname));

        if (found) {
          newOpenSubmenu = { type: menuType as "main" | "others", index };
          submenuMatched = true;
        }
      }
    });
  });
  
  return newOpenSubmenu;
};

export default function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const { isExpanded, isHovered, isMobileOpen, toggleMobileSidebar, toggleSidebar, setIsHovered } = useSidebar();
  const calculatedOpenSubmenu = useMemo(() => getInitialOpenSubmenu(pathname), [pathname]);

  // Dynamic States (Properly moved INSIDE the component function body)
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccountName, setCurrentAccountName] = useState<string>("John Doe");
  const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [openSubmenu, setOpenSubmenu] = useState(calculatedOpenSubmenu);
  const [loggedInUser, setLoggedInUser] = useState<{name: string, avatar: string, email: string} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [selectedType, setSelectedType] = useState<"Personal" | "Business" | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpStep, setOtpStep] = useState(1);
  const [verificationMethod, setVerificationMethod] = useState<"Email" | "Phone" | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpDigits, setOtpDigits] = useState(new Array(6).fill(""));
  const [otpTimer, setOtpTimer] = useState(0);
  const [targetAccount, setTargetAccount] = useState("");
  const [canCreateBusiness, setCanCreateBusiness] = useState(true);
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isMenuOpenRef = useRef(isApplicationMenuOpen);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const isProfilePage = pathname === "/profile";
  
  // Point mappings to the dynamic state array instead of old dummy array
  const targetAccountDetails = accounts.find((acc) => acc.name === targetAccount);

  const activeAccount = useMemo(() => {
    if (loggedInUser && currentAccountName === loggedInUser.name) {
      return {
        id: 0,
        name: loggedInUser.name,
        email: loggedInUser.email,
        avatar: loggedInUser.avatar, 
        type: "Personal" as const,
        isMalaysian: true,
        phone: ""
      };
    }
    
    return accounts.find((acc) => acc.name === currentAccountName) || null;
  }, [currentAccountName, loggedInUser, accounts]);

  const safeAvatar =
  typeof activeAccount?.avatar === "string" &&
  activeAccount.avatar.trim() !== ""
    ? activeAccount.avatar
    : "/images/user/user-07.jpg";

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    setMounted(true);
    const name = localStorage.getItem("currentAccount");
    const username = localStorage.getItem("currentUsername") || name;
    setCurrentUsername(username || "");
    let localAvatar = localStorage.getItem("currentUserAvatar");
    const email = localStorage.getItem("currentUserEmail");
    
    if (name) {
      setCurrentAccountName(name);

      if (localAvatar && localAvatar.length > 100 && !localAvatar.startsWith("data:image")) {
        localAvatar = `data:image/jpeg;base64,${localAvatar}`;
      }

      setLoggedInUser({
        name,
        avatar: localAvatar || "",
        email: email || ""
      });

      if (username) {
        fetch(`/api/profile/${username}`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch profile");
            return res.json();
          })
          .then((data) => {
            if (data && data.avatar) {
              setLoggedInUser(prev => prev ? { ...prev, avatar: data.avatar } : null);
              localStorage.setItem("currentUserAvatar", data.avatar);
            }
          })
          .catch((err) => {
            console.error("Failed to fetch updated avatar:", err);
          });
      }
    }

    // --- UPDATED LIVE DATA FETCH WITH AUTHENTICATION PERSISTENCE ---
    setIsLoadingAccounts(true);
    
    // Pass the active username/account identifier as a query param so /api/user can validate it
    const fetchUrl = username ? `/api/user?username=${encodeURIComponent(username)}` : "/api/user";

    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load user list. Backend status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setAccounts(data);
          // Set a default initial account if local storage is unpopulated
          if (!name && data.length > 0) {
            setCurrentAccountName(data[0].name);
            localStorage.setItem("currentAccount", data[0].name);
          }
        }
      })
      .catch((err) => {
        console.error("Database profile initialization error:", err);
      })
      .finally(() => setIsLoadingAccounts(false));
  }, []);

  useEffect(() => {
    setOpenSubmenu(calculatedOpenSubmenu);
  }, [calculatedOpenSubmenu]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOtpModalOpen && otpStep === 2 && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpModalOpen, otpStep, otpTimer]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    const handleResize = () => {
      if (isMenuOpenRef.current && window.innerWidth < 640) setApplicationMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (isOtpModalOpen && otpStep === 2) {
      setTimeout(() => otpInputsRef.current[0]?.focus(), 0);
    }
  }, [isOtpModalOpen, otpStep]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) => (prev?.type === menuType && prev?.index === index ? null : { type: menuType, index }));
  };

  const handleOpenAccountModal = () => {
    const currentAcc = accounts.find(acc => acc.name === currentAccountName);
    if (currentAcc && currentAcc.type === "Personal" && !currentAcc.isMalaysian) {
      setCanCreateBusiness(false);
    } else {
      setCanCreateBusiness(true);
    }
    setModalStep(1);
    setSelectedType(null);
    setIsModalOpen(true);
  };

  const handleConfirmCreation = () => {
    const currentAcc = accounts.find(acc => acc.name === currentAccountName);
    if (selectedType === "Business") {
      router.push("/business/malaysian/info");
    } else {
      if (currentAcc && !currentAcc.isMalaysian) {
        router.push("/personal/non-malaysian/info");
      } else {
        router.push("/personal/malaysian/info");
      }
    }
    setIsModalOpen(false);
  };

  const handleHeaderToggle = () => {
    if (window.innerWidth >= 1024) toggleSidebar(); else toggleMobileSidebar();
  };

  const toggleUserDropdown = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setIsNotificationOpen(false);
    setIsUserDropdownOpen((prev) => !prev);
  };

  const closeUserDropdown = () => setIsUserDropdownOpen(false);

  const closeOtpModal = () => {
    setIsOtpModalOpen(false);
    setOtpStep(1);
    setVerificationMethod(null);
    setOtpCode("");
    setOtpDigits(new Array(6).fill(""));
    setOtpTimer(0);
    setTargetAccount("");
  };

  const switchAccount = (accountName: string) => {
    if (isProfilePage) {
      closeUserDropdown();
      return;
    }
    const selectedAccount = accounts.find((acc) => acc.name === accountName);
    if (selectedAccount) {
      setTargetAccount(accountName);
      setIsUserDropdownOpen(false);
      setIsOtpModalOpen(true);
      setOtpStep(1);
      setVerificationMethod(null);
      setOtpCode("");
      setOtpDigits(new Array(6).fill(""));
      setOtpTimer(0);
    }
  };

  const handleSendCode = async (method: "Email" | "Phone") => {
    setIsSendingOtp(true);
    
    setVerificationMethod(method);
    
    try {
      if (method === "Email") {
        const email = targetAccountDetails?.email;

        if (!email) {
          alert("No email found for this account.");
          return;
        }

        const res = await fetch("/api/otp/email/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to send email OTP.");
          return;
        }

        setOtpStep(2);
        setOtpTimer(60);
      }

      if (method === "Phone") {
        alert("Phone OTP is not implemented yet.");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      alert("Something went wrong while sending OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!targetAccount) return;

    if (verificationMethod === "Email") {
      const email = targetAccountDetails?.email;
      const enteredOtp = otpDigits.join("");

      if (!email) {
        alert("No email found for this account.");
        return;
      }

      try {
        const res = await fetch("/api/otp/email/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp: enteredOtp,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Invalid OTP. Please try again.");
          return;
        }

        setCurrentAccountName(targetAccount);
        setCurrentUsername(targetAccount);

        localStorage.setItem("currentAccount", targetAccount);
        localStorage.setItem("currentUsername", targetAccount);

        closeOtpModal();
      } catch (error) {
        console.error("Verify switch account OTP error:", error);
        alert("Something went wrong while verifying the OTP.");
      }
    }
  };

  const handleOtpInputChange = (value: string, index: number) => {
    const cleanValue = value.replace(/\D/g, "");

    const newDigits = [...otpDigits];

    if (cleanValue.length <= 1) {
      newDigits[index] = cleanValue;
      setOtpDigits(newDigits);
      setOtpCode(newDigits.join(""));

      if (cleanValue && index < 5) {
        otpInputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      const newDigits = [...otpDigits];

      if (newDigits[index]) {
        // clear current box first
        newDigits[index] = "";
        setOtpDigits(newDigits);
        setOtpCode(newDigits.join(""));
      } else if (index > 0) {
        // move back and clear previous
        newDigits[index - 1] = "";
        setOtpDigits(newDigits);
        setOtpCode(newDigits.join(""));
        otpInputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer !== 0 || !verificationMethod) return;

    setOtpDigits(new Array(6).fill(""));
    setOtpCode("");

    await handleSendCode(verificationMethod);
  };

  const headerDisplayName = activeAccount
    ? `${activeAccount.name.split(" ")[0]} (${activeAccount.type})`
    : "Account";

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        const isOpen = openSubmenu?.type === menuType && openSubmenu?.index === index;
        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <>
                <button
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  type="button"
                  className={`menu-item group w-full ${isOpen ? "menu-item-active" : "menu-item-inactive"} cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                >
                  <span className={`${isOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>{nav.icon}</span>
                  {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                  {(isExpanded || isHovered || isMobileOpen) && <ChevronDownIcon className={`ml-auto w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180 text-brand-500" : ""}`} />}
                </button>
                {isOpen && (isExpanded || isHovered || isMobileOpen) && (
                  <ul className="mt-2 flex flex-col gap-2 px-9">
                    {nav.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link href={subItem.path} className={`menu-dropdown-item ${isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}>
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              nav.path && (
                nav.name === "Add Account" ? (
                  <button onClick={handleOpenAccountModal} className="w-full text-left">
                    <div className="menu-item group cursor-pointer menu-item-inactive">
                      <span className="menu-item-icon-inactive">{nav.icon}</span>
                      {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                    </div>
                  </button>
                ) : (
                  <Link href={nav.path} className="block">
                    <div className={`menu-item group cursor-pointer ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}>
                      <span className={`${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>{nav.icon}</span>
                      {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                    </div>
                  </Link>
                )
              )
            )}
          </li>
        );
      })}
    </ul>
  );

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/reset-password");
  const mainContentMargin = isMobileOpen ? "ml-0" : isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]";

  if (isAuthPage) return <div className="min-h-screen">{children}</div>;

  return (
    <div className="min-h-screen xl:flex">
      {!mounted ? (
        <aside className="fixed mt-16 lg:mt-0 top-0 left-0 w-[90px] h-screen border-r border-white/10" style={{ backgroundColor: '#3D405B' }} />
      ) : (
        <aside
          className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 text-white h-screen transition-all duration-300 ease-in-out z-[99999] border-r border-white/10 
            ${isExpanded || isMobileOpen || isHovered ? "w-[290px] max-w-[85vw]" : "w-[90px]"}
            ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
          style={{ backgroundColor: '#3D405B' }}
          onMouseEnter={() => !isExpanded && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className={`py-8 flex items-center justify-between ${
              !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
            }`}
          >
            <Link 
              href="/" 
              className="flex items-center gap-2"
            >
              <Image 
                src="/images/logo/logo-light.svg" 
                alt="Logo" 
                width={40} 
                height={40} className="block" 
              />

              {(isExpanded || isHovered || isMobileOpen) && 
                <h1 className="text-2xl font-bold uppercase tracking-tight text-white">
                  DTCOB
                </h1>
              }
            </Link>
          </div>
          
          <div className="flex flex-col flex-1 overflow-y-auto duration-300 ease-linear no-scrollbar">
            <nav className="mb-6">
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className={`mb-4 text-xs uppercase flex leading-5 text-white/50 ${
                    !isExpanded && !isHovered 
                      ? "lg:justify-center" 
                      : "justify-start"
                    }`}
                  >
                    {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
                  </h2>

                  {renderMenuItems(navItems, "main")}
                </div>

                <div>
                  <h2 className={`mb-4 text-xs uppercase flex leading-5 text-white/50 ${
                    !isExpanded && !isHovered 
                      ? "lg:justify-center" 
                      : "justify-start"
                    }`}
                  >
                    {isExpanded || isHovered || isMobileOpen ? "Others" : <HorizontaLDots />}
                  </h2>

                  {renderMenuItems(othersItems, "others")}
                </div>
              </div>
            </nav>
          </div>
        </aside>
      )}

      {isMobileOpen && (
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden text-white/80 hover:text-white"
        >
          ✕
        </button>
      )}

      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <header 
          className="sticky top-0 flex w-full border-gray-200 z-[99999] dark:border-gray-800 lg:border-b"
          style={{ backgroundColor: '#3D405B' }}
        >
          <div className="relative flex flex-col items-center grow lg:flex-row lg:px-6">
            <div className="flex items-center justify-between lg:justify-start w-full lg:w-auto gap-4 px-3 py-3 border-b dark:border-gray-800 lg:border-b-0 lg:px-0 lg:py-4">
              <button 
                id="header-toggle-btn" 
                className="items-center justify-center w-10 h-10 text-white rounded-lg z-[99999] lg:flex lg:h-11 lg:w-11 lg:border border-white/20"
                onClick={handleHeaderToggle}
              >
                <NavigationIcon
                  className={`w-7 h-7 transition-transform duration-300 ${
                    isMobileOpen ? 'rotate-90' : ''
                  } text-white`}
                />
              </button>

              <Link 
                href="/" 
                className="lg:hidden flex items-center gap-1"
              >
                <Image 
                  width={40} 
                  height={32} 
                  src="/images/logo/logo-light.svg" 
                  alt="Logo" 
                />

                <h1 className="font-semibold text-white text-lg">
                  DTCOB
                </h1>
              </Link>

              <button
                onClick={() => setApplicationMenuOpen(!isApplicationMenuOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 text-white rounded-lg hover:bg-white/10 transition-all"
              >
                <MoreDotIcon className="w-6 h-6" />
              </button>

              <div className="hidden lg:block">
                <form>
                  <div className="relative">
                    <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none z-10">
                      <svg 
                        className="fill-gray-400 dark:fill-white/60" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 20 20" 
                        fill="none"
                      >
                        <path 
                          fillRule="evenodd" 
                          clipRule="evenodd" 
                          d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z" 
                        />
                      </svg>
                    </span>

                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search or type command..."
                      className="w-[240px] xl:w-[340px] py-2.5 pl-12 pr-14 text-sm transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:placeholder-gray-400 dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 shadow-theme-xs"
                    />

                    <button className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 rounded-lg border border-gray-200 dark:border-white/20 bg-gray-50 dark:bg-white/10 px-[7px] py-[4.5px] text-xs font-medium text-gray-500 dark:text-white/70">
                      <span>⌘</span>
                      <span>K</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div
              className={`${isApplicationMenuOpen ? "flex" : "hidden"} lg:flex flex-col lg:flex-row absolute lg:static top-full right-0 left-0 lg:left-auto w-full lg:w-auto bg-[#3D405B] lg:bg-transparent px-5 py-4 lg:px-0 lg:py-0 gap-4 shadow-xl lg:shadow-none z-[99999] lg:ml-auto`}>
              <div className="flex items-center justify-between w-full lg:w-auto gap-3">
                <div className="relative z-[99999] flex items-center gap-2 2xsm:gap-3 overflow-visible">
                  <ThemeToggleButton />
                  <NotificationDropdown
                    isOpen={isNotificationOpen}
                    setIsOpen={setIsNotificationOpen}
                    closeUserDropdown={closeUserDropdown}
                  />
                </div>

                <div className="block lg:hidden w-full">
                  <form>
                    <div className="relative">
                      <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none z-10">
                        <svg className="fill-gray-400" width="20" height="20" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                          />
                        </svg>
                      </span>

                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search or type command..."
                        className="w-full py-3 pl-12 pr-4 text-sm bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20"
                      />
                      <button className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 rounded-lg border border-gray-200 dark:border-white/20 bg-gray-50 dark:bg-white/10 px-[7px] py-[4.5px] text-xs font-medium text-gray-500 dark:text-white/70">
                        <span>⌘</span>
                        <span>K</span>
                      </button>
                    </div>
                  </form>
                </div>
                <div className="relative">
                  <button 
                    onClick={toggleUserDropdown} 
                    className="flex items-center text-white dropdown-toggle"
                  >
                    <div className="mr-3 overflow-hidden rounded-full h-11 w-11 shrink-0 border border-white/20 bg-gray-700">
                      <img 
                        className="w-full h-full object-cover" 
                        src={safeAvatar}
                        alt="User" 
                        onError={(e) => {(e.target as HTMLImageElement).src = "/images/user/user-07.jpg";}}
                      />
                    </div>
                    
                    <span className="hidden xl:block mr-1 font-medium text-theme-sm whitespace-nowrap">
                      {headerDisplayName}
                    </span>
                    
                    <svg 
                      className={`stroke-white transition-transform duration-200 ${isUserDropdownOpen ? "rotate-180" : ""}`} 
                      width="18" 
                      height="20" 
                      viewBox="0 0 18 20" 
                      fill="none"
                    >
                      <path 
                        d="M4.3125 8.65625L9 13.3437L13.6875 8.65625" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    </svg>
                  </button>

                  <Dropdown 
                    isOpen={isUserDropdownOpen} 
                    onClose={closeUserDropdown} 
                    className="absolute right-0 mt-[17px] flex w-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
                  >
                    <div className="mt-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                      <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Switch Account
                      </p>

                      {isProfilePage && 
                        <p className="mb-3 text-xs text-error-500 dark:text-error-400">
                          Account switching is disabled on this page.
                        </p>
                      }

                      <ul className="flex flex-col gap-1">
                        {isLoadingAccounts ? (
                          <p className="text-xs text-gray-400 p-3 text-center">Loading live profiles...</p>
                        ) : accounts.length === 0 ? (
                          <p className="text-xs text-gray-400 p-3 text-center">No database accounts found.</p>
                        ) : (
                          accounts
                            .filter((account) => account.name.toLowerCase() !== currentUsername.toLowerCase())
                            .map((account) => {
                            const displayAvatar =
                              typeof account.avatar === "string" && account.avatar.trim() !== ""
                                ? account.avatar
                                : "/images/user/user-07.jpg";

                            return (
                              <li key={account.id}>
                                <button
                                  onClick={() => switchAccount(account.name)}
                                  disabled={isProfilePage}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-theme-sm transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                                >
                                  <div className="overflow-hidden rounded-full h-9 w-9 shrink-0 border border-gray-200 dark:border-gray-700">
                                    <img 
                                      className="w-full h-full object-cover" 
                                      src={displayAvatar} 
                                      alt={account.name} 
                                      onError={(e) => {(e.target as HTMLImageElement).src = "/images/user/user-07.jpg";}}
                                    />
                                  </div>

                                  <div className="text-left">
                                    <p className="text-xs font-medium">
                                      {account.name}
                                    </p>

                                    <p className="text-[11px] opacity-75">
                                      {account.email}
                                    </p>
                                  </div>

                                  
                                </button>
                              </li>
                            );
                          })
                        )}
                      </ul>
                    </div>
                    
                    <ul className="flex flex-col gap-1 py-3 border-b border-gray-200 dark:border-gray-800">
                      <li>
                        <DropdownItem 
                          onItemClick={closeUserDropdown} 
                          tag="a" 
                          href="/dashboard/profile" 
                          className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                        >
                          <svg className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400" width="24" height="24" viewBox="0 0 24 24">
                            <path d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z" />
                          </svg>
                          Edit profile
                        </DropdownItem>
                      </li>
                      <li>
                        <DropdownItem 
                          onItemClick={closeUserDropdown} 
                          tag="a" 
                          href="/dashboard/profile" 
                          className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                        >
                          <svg className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400" width="24" height="24" viewBox="0 0 24 24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M10.4858 3.5L13.5182 3.5C13.9233 3.5 14.2518 3.82851 14.2518 4.23377C14.2518 5.9529 16.1129 7.02795 17.602 6.1682C17.9528 5.96567 18.4014 6.08586 18.6039 6.43667L20.1203 9.0631C20.3229 9.41407 20.2027 9.86286 19.8517 10.0655C18.3625 10.9253 18.3625 13.0747 19.8517 13.9345C20.2026 14.1372 20.3229 14.5859 20.1203 14.9369L18.6039 17.5634C18.4013 17.9142 17.9528 18.0344 17.602 17.8318C16.1129 16.9721 14.2518 18.0471 14.2518 19.7663C14.2518 20.1715 13.9233 20.5 13.5182 20.5H10.4858C10.0804 20.5 9.75182 20.1714 9.75182 19.766C9.75182 18.0461 7.88983 16.9717 6.40067 17.8314C6.04945 18.0342 5.60037 17.9139 5.39767 17.5628L3.88167 14.937C3.67903 14.586 3.79928 14.1372 4.15026 13.9346C5.63949 13.0748 5.63946 10.9253 4.15025 10.0655C3.79926 9.86282 3.67901 9.41401 3.88165 9.06303L5.39764 6.43725C5.60034 6.08617 6.04943 5.96581 6.40065 6.16858C7.88982 7.02836 9.75182 5.9539 9.75182 4.23399C9.75182 3.82862 10.0804 3.5 10.4858 3.5ZM13.5182 2L10.4858 2C9.25201 2 8.25182 3.00019 8.25182 4.23399C8.25182 4.79884 7.64013 5.15215 7.15065 4.86955C6.08213 4.25263 4.71559 4.61859 4.0986 5.68725L2.58261 8.31303C1.96575 9.38146 2.33183 10.7477 3.40025 11.3645C3.88948 11.647 3.88947 12.3531 3.40026 12.6355C2.33184 13.2524 1.96578 14.6186 2.58263 15.687L4.09863 18.3128C4.71562 19.3814 6.08215 19.7474 7.15067 19.1305C7.64015 18.8479 8.25182 19.2012 8.25182 19.766C8.25182 20.9998 9.25201 22 10.4858 22H13.5182C14.7519 22 15.7518 20.9998 15.7518 19.7663C15.7518 19.2015 16.3632 18.8487 16.852 19.1309C17.9202 19.7476 19.2862 19.3816 19.9029 18.3134L21.4193 15.6869C22.0361 14.6185 21.6701 13.2523 20.6017 12.6355C20.1125 12.3531 20.1125 11.647 20.6017 11.3645C21.6701 10.7477 22.0362 9.38152 21.4193 8.3131L19.903 5.68667C19.2862 4.61842 17.9202 4.25241 16.852 4.86917C16.3632 5.15138 15.7518 4.79856 15.7518 4.23377C15.7518 3.00024 14.7519 2 13.5182 2ZM9.6659 11.9999C9.6659 10.7103 10.7113 9.66493 12.0009 9.66493C13.2905 9.66493 14.3359 10.7103 14.3359 11.9999C14.3359 13.2895 13.2905 14.3349 12.0009 14.3349C10.7113 14.3349 9.6659 13.2895 9.6659 11.9999ZM12.0009 8.16493C9.88289 8.16493 8.1659 9.88191 8.1659 11.9999C8.1659 14.1179 9.88289 15.8349 12.0009 15.8349C14.1189 15.8349 15.8359 14.1179 15.8359 11.9999C15.8359 9.88191 14.1189 8.16493 12.0009 8.16493Z" />
                          </svg>
                          Support
                        </DropdownItem>
                      </li>
                    </ul>
                    
                    <Link 
                      href="/login" 
                      className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                    >
                      <svg className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300" width="24" height="24" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.23377 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z" />
                      </svg>
                      Sign out
                    </Link>
                  </Dropdown>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>

      {/* Account Type Selection Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        className="max-w-[700px] m-40 lg:m-0"
      >
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-[#F9FAFB] p-8 dark:bg-gray-950 shadow-2xl">
          {modalStep === 1 ? (
            <>
              <div className="text-center mb-10">
                <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                  Select Account Type
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please select the type of account you would like to create.
                </p>
              </div>

              <div className={`grid grid-cols-1 gap-6 ${canCreateBusiness ? 'sm:grid-cols-2' : 'max-w-xs mx-auto'}`}>
                <div 
                  onClick={() => setSelectedType("Personal")} 
                  className={`relative cursor-pointer p-8 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center group backdrop-blur-sm ${
                    selectedType === "Personal" 
                      ? 'border-[#F0CA8E] bg-white shadow-lg ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#F0CA8E] dark:ring-[#3D405B]/40' 
                      : 'border-gray-200 bg-white/70 hover:border-[#F0CA8E]/50 dark:border-gray-800 dark:bg-gray-900/70'
                  }`}
                >
                  {selectedType === "Personal" && (
                    <div className="absolute top-3 right-3 bg-[#F0CA8E] text-white p-1 rounded-full shadow-sm">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <h3 className={`text-lg font-bold mb-2 ${selectedType === "Personal" ? 'text-[#3D405B] dark:text-white' : 'text-gray-800 dark:text-white'}`}>
                    Personal Account
                  </h3>
                  <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    Create a new personal banking account
                  </p>
                </div>

                {canCreateBusiness && (
                  <div 
                    onClick={() => setSelectedType("Business")} 
                    className={`relative cursor-pointer p-8 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center group backdrop-blur-sm ${
                      selectedType === "Business" 
                        ? 'border-[#F0CA8E] bg-white shadow-lg ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#F0CA8E] dark:ring-[#3D405B]/40' 
                        : 'border-gray-200 bg-white/70 hover:border-[#F0CA8E]/50 dark:border-gray-800 dark:bg-gray-900/70'
                    }`}
                  >
                    {selectedType === "Business" && (
                      <div className="absolute top-3 right-3 bg-[#F0CA8E] text-white p-1 rounded-full shadow-sm">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <h3 className={`text-lg font-bold mb-2 ${selectedType === "Business" ? 'text-[#3D405B] dark:text-white' : 'text-gray-800 dark:text-white'}`}>
                      Business Account
                    </h3>
                    <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      Create a new business banking account
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col items-center">
                <button 
                  onClick={() => setModalStep(2)} 
                  disabled={!selectedType} 
                  className={`inline-flex items-center justify-center w-full max-w-md px-4 py-3 text-sm font-bold text-white transition rounded-lg shadow-theme-xs ${
                    selectedType 
                      ? 'bg-[#3D405B] hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                  }`}
                >
                  {isSendingOtp ? "Sending..." : "Continue"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                  Confirm Account Creation
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Would you like to proceed with creating this account?
                </p>
              </div>
              
              <div className="relative p-4 mb-8 rounded-2xl border-2 transition-all duration-300 text-center backdrop-blur-sm max-w-xs mx-auto border-[#F0CA8E] bg-white/90 shadow-lg ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#F0CA8E] dark:ring-[#F0CA8E]/20">
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {selectedType} Account
                </p>
                <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Selected Account Type
                </p>
              </div>

              <div className="flex flex-row gap-3">
                <button 
                  onClick={() => setModalStep(1)} 
                  className="inline-flex items-center justify-center flex-1 px-4 py-3 text-sm font-bold transition bg-transparent border-2 rounded-lg text-gray-700 border-gray-200 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-900"
                >
                  No, go back
                </button>
                <button 
                  onClick={handleConfirmCreation} 
                  className="inline-flex items-center justify-center flex-1 px-4 py-3 text-sm font-bold text-white transition rounded-lg bg-[#3D405B] shadow-theme-xs hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]"
                >
                  Yes, continue
                </button>
              </div>
            </>
          )}

          <footer className="relative mt-8 text-xs text-gray-400 text-center z-10">
            &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
          </footer>
        </div>
      </Modal>

      {/* Account Switching Security Modal */}
      <Modal 
        isOpen={isOtpModalOpen} 
        onClose={closeOtpModal} 
        className="max-w-[700px] m-40 lg:m-0"
      >
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-[#F9FAFB] p-8 dark:bg-gray-950 shadow-2xl">
          {otpStep === 1 ? (
            <>
              <div className="text-center mb-10">
                <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                  Select Verification Method
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  A security code is required to switch to the account: <span className="font-bold text-gray-800 dark:text-white">{targetAccount}</span>. Select your method.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div 
                  onClick={() => setVerificationMethod("Email")} 
                  className={`relative cursor-pointer p-8 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center group backdrop-blur-sm ${
                    verificationMethod === "Email" 
                      ? 'border-[#F0CA8E] bg-white shadow-lg ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#F0CA8E] dark:ring-[#3D405B]/40' 
                      : 'border-gray-200 bg-white/70 hover:border-[#F0CA8E]/50 dark:border-gray-800 dark:bg-gray-900/70'
                  }`}
                >
                  {verificationMethod === "Email" && (
                    <div className="absolute top-3 right-3 bg-[#F0CA8E] text-white p-1 rounded-full shadow-sm">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <h3 className={`text-lg font-bold mb-2 ${verificationMethod === "Email" ? 'text-[#3D405B] dark:text-white' : 'text-gray-800 dark:text-white'}`}>
                    Via Email
                  </h3>
                  <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    Receive code at your registered email address.
                  </p>
                </div>

                <div 
                  onClick={() => setVerificationMethod("Phone")} 
                  className={`relative cursor-pointer p-8 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center group backdrop-blur-sm ${
                    verificationMethod === "Phone" 
                      ? 'border-[#F0CA8E] bg-white shadow-lg ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#F0CA8E] dark:ring-[#3D405B]/40' 
                      : 'border-gray-200 bg-white/70 hover:border-[#F0CA8E]/50 dark:border-gray-800 dark:bg-gray-900/70'
                  }`}
                >
                  {verificationMethod === "Phone" && (
                    <div className="absolute top-3 right-3 bg-[#F0CA8E] text-white p-1 rounded-full shadow-sm">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <h3 className={`text-lg font-bold mb-2 ${verificationMethod === "Phone" ? 'text-[#3D405B] dark:text-white' : 'text-gray-800 dark:text-white'}`}>
                    Via Phone Number
                  </h3>
                  <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    Receive code via SMS to your registered phone number.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex flex-col items-center">
                <button 
                  onClick={() => handleSendCode(verificationMethod!)} 
                  disabled={!verificationMethod || isSendingOtp} 
                  className={`inline-flex items-center justify-center w-full max-w-md px-4 py-3 text-sm font-bold text-white transition rounded-lg shadow-theme-xs ${
                    verificationMethod 
                      ? 'bg-[#3D405B] hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                  }`}
                >
                  {isSendingOtp ? "Sending..." : "Continue"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                  {verificationMethod === "Email" ? "Verify Your Email" : "Verify Your Phone Number"}
                </h1>
                {verificationMethod === "Email" ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    We've sent a 6-digit code to <span className="font-bold text-gray-900 dark:text-white">{targetAccountDetails?.email}</span>. Please provide the code to proceed.
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    We've sent a 6-digit code to <span className="font-bold text-gray-900 dark:text-white">+60 {targetAccountDetails?.phone}</span>. Please provide the code to proceed.
                  </p>
                )}
              </div>

              <div className="flex justify-center gap-2 mb-8">
                {otpDigits.map((digit, index) => (
                  <input 
                    key={index} 
                    type="text" 
                    inputMode="numeric" 
                    maxLength={1} 
                    ref={(el) => { otpInputsRef.current[index] = el; }} 
                    value={digit} 
                    onChange={(e) => handleOtpInputChange(e.target.value, index)} 
                    onKeyDown={(e) => handleOtpKeyDown(e as React.KeyboardEvent<HTMLInputElement>, index)} 
                    className="w-12 h-14 text-center text-xl font-bold transition-all border-2 rounded-xl outline-none border-gray-200 bg-white focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40" 
                  />
                ))}
              </div>

              <div className="flex justify-center mb-6">
                {otpTimer > 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Resend code in{" "}
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {otpTimer}s
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <div className="flex flex-row gap-3">
                <button 
                  onClick={() => { setOtpStep(1); setOtpCode(''); setOtpDigits(new Array(6).fill('')); }} 
                  className="inline-flex items-center justify-center flex-1 px-4 py-3 text-sm font-bold transition bg-transparent border-2 rounded-lg text-gray-700 border-gray-200 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-900"
                >
                  No, go back
                </button>
                <button 
                  onClick={handleVerifyOtp} 
                  disabled={otpCode.length !== 6} 
                  className={`inline-flex items-center justify-center flex-1 px-4 py-3 text-sm font-bold text-white transition rounded-lg shadow-theme-xs ${
                    otpCode.length === 6 
                      ? 'bg-[#3D405B] hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                  }`}
                >
                  Verify
                </button>
              </div>
            </>
          )}

          <footer className="relative mt-8 text-xs text-gray-400 text-center z-10">
            &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
          </footer>
        </div>
      </Modal>
    </div>
  );
}