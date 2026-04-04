"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ApexOptions } from "apexcharts";
import { worldMill } from "@react-jvectormap/world";

import Badge from "@/components/ui/badge/Badge";
import ArrowDownIcon from "@/icons/arrow-down.svg";
import ArrowUpIcon from "@/icons/arrow-up.svg";
import BalanceIcon from "@/icons/balance-icon.svg";
import DollarLineIcon from "@/icons/dollar-line.svg";
import MoreDotIcon from "@/icons/more-dot.svg";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const VectorMap = dynamic(
  () => import("@react-jvectormap/core").then((mod) => mod.VectorMap),
  { ssr: false }
);

interface CountryMapProps {
  mapColor?: string;
}

type MarkerStyle = {
  initial: {
    fill: string;
    r: number;
  };
};

type Marker = {
  latLng: [number, number];
  name: string;
  style?: {
    fill: string;
    borderWidth: number;
    borderColor: string;
    stroke?: string;
    strokeOpacity?: number;
  };
};

const CountryMap: React.FC<CountryMapProps> = ({ mapColor }) => {
  return (
    <VectorMap
      map={worldMill}
      backgroundColor="transparent"
      markerStyle={
        {
          initial: {
            fill: "#465FFF",
            r: 4,
          },
        } as MarkerStyle
      }
      markersSelectable={true}
      markers={
        [
          {
            latLng: [37.2580397, -104.657039],
            name: "United States",
            style: {
              fill: "#465FFF",
              borderWidth: 1,
              borderColor: "white",
              stroke: "#383f47",
            },
          },
          {
            latLng: [20.7504374, 73.7276105],
            name: "India",
            style: { fill: "#465FFF", borderWidth: 1, borderColor: "white" },
          },
          {
            latLng: [53.613, -11.6368],
            name: "United Kingdom",
            style: { fill: "#465FFF", borderWidth: 1, borderColor: "white" },
          },
          {
            latLng: [-25.0304388, 115.2092761],
            name: "Sweden",
            style: {
              fill: "#465FFF",
              borderWidth: 1,
              borderColor: "white",
              strokeOpacity: 0,
            },
          },
        ] as Marker[]
      }
      zoomOnScroll={false}
      zoomMax={12}
      zoomMin={1}
      zoomAnimate={true}
      zoomStep={1.5}
      regionStyle={{
        initial: {
          fill: mapColor || "#D0D5DD",
          fillOpacity: 1,
          fontFamily: "Outfit",
          stroke: "none",
          strokeWidth: 0,
          strokeOpacity: 0,
        },
        hover: {
          fillOpacity: 0.7,
          cursor: "pointer",
          fill: "#465fff",
          stroke: "none",
        },
        selected: {
          fill: "#465FFF",
        },
        selectedHover: {},
      }}
      regionLabelStyle={{
        initial: {
          fill: "#35373e",
          fontWeight: 500,
          fontSize: "13px",
          stroke: "none",
        },
        hover: {},
        selected: {},
        selectedHover: {},
      }}
    />
  );
};

export default function Dashboard() {
  const [isSalesDropdownOpen, setIsSalesDropdownOpen] = useState(false);
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);
  const [isDemoDropdownOpen, setIsDemoDropdownOpen] = useState(false);
  const [isOrdersDropdownOpen, setIsOrdersDropdownOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"optionOne" | "optionTwo" | "optionThree">("optionOne");

  const getTabClass = (option: string) =>
    selectedTab === option
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  const salesChartOptions: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: { show: true, position: "top", horizontalAlign: "left", fontFamily: "Outfit" },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: { x: { show: false }, y: { formatter: (val: number) => `${val}` } },
  };
  const salesChartSeries = [{ name: "Sales", data: [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112] }];

  const targetChartSeries = [75.55];
  const targetChartOptions: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "80%" },
        track: { background: "#E4E7EC", strokeWidth: "100%", margin: 5 },
        dataLabels: {
          name: { show: false },
          value: { fontSize: "36px", fontWeight: "600", offsetY: -40, color: "#1D2939", formatter: (val) => val + "%" },
        },
      },
    },
    fill: { type: "solid", colors: ["#465FFF"] },
    stroke: { lineCap: "round" },
    labels: ["Progress"],
  };

  const statisticsChartOptions: ApexOptions = {
    legend: { show: false, position: "top", horizontalAlign: "left" },
    colors: ["#465FFF", "#9CB9FF"],
    chart: { fontFamily: "Outfit, sans-serif", height: 310, type: "line", toolbar: { show: false } },
    stroke: { curve: "straight", width: [2, 2] },
    fill: { type: "gradient", gradient: { opacityFrom: 0.55, opacityTo: 0 } },
    markers: { size: 0, strokeColors: "#fff", strokeWidth: 2, hover: { size: 6 } },
    grid: { xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
    dataLabels: { enabled: false },
    tooltip: { enabled: true, x: { format: "dd MMM yyyy" } },
    xaxis: {
      type: "category",
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: { style: { fontSize: "12px", colors: ["#6B7280"] } },
      title: { text: "", style: { fontSize: "0px" } },
    },
  };
  const statisticsChartSeries = [
    { name: "Sales", data: [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235] },
    { name: "Revenue", data: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140] },
  ];

  const recentOrders = [
    { id: 1, user: { name: "Lindsey Thompson", email: "lindsey@example.com", image: "/images/user/user-01.jpg" }, product: "MacBook Pro", price: "RM 2,399", status: "Completed" },
    { id: 2, user: { name: "Angelica Ramos", email: "angelica@example.com", image: "/images/user/user-02.jpg" }, product: "iPhone 15 Pro", price: "RM 999", status: "Pending" },
    { id: 3, user: { name: "Dayne Fraser", email: "dayne@example.com", image: "/images/user/user-03.jpg" }, product: "Apple Watch", price: "RM 399", status: "Canceled" },
    { id: 4, user: { name: "Kaiya George", email: "kaiya@example.com", image: "/images/user/user-04.jpg" }, product: "Magic Keyboard", price: "RM 159", status: "Completed" },
  ];

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <BalanceIcon className="text-gray-800 size-6 dark:text-white/90" />
            </div>
            <div className="flex items-end justify-between mt-5">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Balance</span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">RM 3,782</h4>
              </div>
              <Badge color="success">
                <ArrowUpIcon /> 11.01%
              </Badge>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <DollarLineIcon className="text-gray-800 dark:text-white/90" />
            </div>
            <div className="flex items-end justify-between mt-5">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Spendings</span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">RM 5,359</h4>
              </div>
              <Badge color="error">
                <ArrowDownIcon className="text-error-500" /> 9.05%
              </Badge>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Monthly Sales</h3>
            <div className="relative inline-block">
              <button onClick={() => setIsSalesDropdownOpen(!isSalesDropdownOpen)} className="dropdown-toggle">
                <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
              </button>
              <Dropdown isOpen={isSalesDropdownOpen} onClose={() => setIsSalesDropdownOpen(false)} className="w-40 p-2">
                <DropdownItem onItemClick={() => setIsSalesDropdownOpen(false)} className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">View More</DropdownItem>
                <DropdownItem onItemClick={() => setIsSalesDropdownOpen(false)} className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">Delete</DropdownItem>
              </Dropdown>
            </div>
          </div>
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
              <ReactApexChart options={salesChartOptions} series={salesChartSeries} type="bar" height={180} />
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 xl:col-span-5">
        <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/3">
          <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">This Month&apos;s Spendings</h3>
                <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">Target you&apos;ve set for each month</p>
              </div>
              <div className="relative inline-block">
                <button onClick={() => setIsTargetDropdownOpen(!isTargetDropdownOpen)} className="dropdown-toggle">
                  <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
                </button>
                <Dropdown isOpen={isTargetDropdownOpen} onClose={() => setIsTargetDropdownOpen(false)} className="w-40 p-2">
                  <DropdownItem tag="a" onItemClick={() => setIsTargetDropdownOpen(false)} className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">View More</DropdownItem>
                  <DropdownItem tag="a" onItemClick={() => setIsTargetDropdownOpen(false)} className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">Delete</DropdownItem>
                </Dropdown>
              </div>
            </div>
            <div className="relative">
              <div className="max-h-[330px]">
                <ReactApexChart options={targetChartOptions} series={targetChartSeries} type="radialBar" height={330} />
              </div>
              <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">+10%</span>
            </div>
            <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">You spent RM 3287 this month, it&apos;s lower than last month. Keep up your good work!</p>
          </div>
          <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
            <div>
              <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">Target</p>
              <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
                RM20K
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7.26816 13.6632C7.4056 13.8192 7.60686 13.9176 7.8311 13.9176C7.83148 13.9176 7.83187 13.9176 7.83226 13.9176C8.02445 13.9178 8.21671 13.8447 8.36339 13.6981L12.3635 9.70076C12.6565 9.40797 12.6567 8.9331 12.3639 8.6401C12.0711 8.34711 11.5962 8.34694 11.3032 8.63973L8.5811 11.36L8.5811 2.5C8.5811 2.08579 8.24531 1.75 7.8311 1.75C7.41688 1.75 7.0811 2.08579 7.0811 2.5L7.0811 11.3556L4.36354 8.63975C4.07055 8.34695 3.59568 8.3471 3.30288 8.64009C3.01008 8.93307 3.01023 9.40794 3.30321 9.70075L7.26816 13.6632Z" fill="#D92D20"/></svg>
              </p>
            </div>
            <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>
            <div>
              <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">Revenue</p>
              <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
                RM20K
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z" fill="#039855"/></svg>
              </p>
            </div>
            <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>
            <div>
              <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">This Month</p>
              <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
                RM20K
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z" fill="#039855"/></svg>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12">
        <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
          <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
            <div className="w-full">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Monthly Insights</h3>
              <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">Expenses you’ve spent for each month</p>
            </div>
            <div className="flex items-start w-full gap-3 sm:justify-end">
              <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
                <button
                  onClick={() => setSelectedTab("optionOne")}
                  className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getTabClass("optionOne")}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedTab("optionTwo")}
                  className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getTabClass("optionTwo")}`}
                >
                  Quarterly
                </button>
                <button
                  onClick={() => setSelectedTab("optionThree")}
                  className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getTabClass("optionThree")}`}
                >
                  Annually
                </button>
              </div>
            </div>
          </div>
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-[1000px] xl:min-w-full">
              <ReactApexChart options={statisticsChartOptions} series={statisticsChartSeries} type="area" height={310} />
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 xl:col-span-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 sm:p-6">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Overseas Transactions</h3>
              <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">Number of transactions based on country</p>
            </div>
            <div className="relative inline-block">
              <button onClick={() => setIsDemoDropdownOpen(!isDemoDropdownOpen)} className="dropdown-toggle">
                <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
              </button>
              <Dropdown isOpen={isDemoDropdownOpen} onClose={() => setIsDemoDropdownOpen(false)} className="w-40 p-2">
                <DropdownItem onItemClick={() => setIsDemoDropdownOpen(false)} className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">View More</DropdownItem>
                <DropdownItem onItemClick={() => setIsDemoDropdownOpen(false)} className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">Delete</DropdownItem>
              </Dropdown>
            </div>
          </div>
          <div className="px-4 py-6 my-6 overflow-hidden border border-gary-200 rounded-2xl bg-gray-50 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
            <div id="mapOne" className="mapOne map-btn -mx-4 -my-6 h-[212px] w-[252px] 2xsm:w-[307px] xsm:w-[358px] sm:-mx-6 md:w-[668px] lg:w-[634px] xl:w-[393px] 2xl:w-[554px]">
              <CountryMap />
            </div>
          </div>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="items-center w-full rounded-full max-w-8">
                  <Image width={48} height={48} src="/images/country/country-01.svg" alt="usa" className="w-full" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">USA</p>
                  <span className="block text-gray-500 text-theme-xs dark:text-gray-400">RM 2,379 </span>
                </div>
              </div>
              <div className="flex w-full max-w-[140px] items-center gap-3">
                <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                  <div className="absolute left-0 top-0 flex h-full w-[79%] items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"></div>
                </div>
                <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">79%</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="items-center w-full rounded-full max-w-8">
                  <Image width={48} height={48} className="w-full" src="/images/country/country-02.svg" alt="france" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">France</p>
                  <span className="block text-gray-500 text-theme-xs dark:text-gray-400">RM 589 </span>
                </div>
              </div>
              <div className="flex w-full max-w-[140px] items-center gap-3">
                <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                  <div className="absolute left-0 top-0 flex h-full w-[23%] items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"></div>
                </div>
                <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">23%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 xl:col-span-7">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Recent Orders</h3>
            <div className="relative inline-block">
              <button onClick={() => setIsOrdersDropdownOpen(!isOrdersDropdownOpen)} className="dropdown-toggle">
                <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
              </button>
              <Dropdown isOpen={isOrdersDropdownOpen} onClose={() => setIsOrdersDropdownOpen(false)} className="w-40 p-2">
                <DropdownItem onItemClick={() => setIsOrdersDropdownOpen(false)} className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">View More</DropdownItem>
                <DropdownItem onItemClick={() => setIsOrdersDropdownOpen(false)} className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">Delete</DropdownItem>
              </Dropdown>
            </div>
          </div>
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-5 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">User</th>
                  <th className="px-5 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Product</th>
                  <th className="px-5 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Price</th>
                  <th className="px-5 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full">
                          <Image src={order.user.image} alt={order.user.name} width={40} height={40} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white/90">{order.user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{order.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{order.product}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{order.price}</td>
                    <td className="px-5 py-4">
                      <Badge color={order.status === "Completed" ? "success" : order.status === "Pending" ? "warning" : "error"}>
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}