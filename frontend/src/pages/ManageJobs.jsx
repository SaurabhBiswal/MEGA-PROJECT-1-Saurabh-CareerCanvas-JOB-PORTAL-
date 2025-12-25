import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import { motion } from "framer-motion";
import { FiBriefcase, FiCheckCircle, FiUsers, FiPlus, FiMapPin, FiCalendar } from "react-icons/fi";

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { backendUrl, companyToken } = useContext(AppContext);

  const fetchCompanyJobs = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(backendUrl + "/api/company/list-jobs", {
        headers: { token: companyToken },
      });
      if (data.success) {
        setJobs(Array.isArray(data.jobsData) ? data.jobsData.reverse() : []);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const changeJobVisiblity = async (id) => {
    try {
      const { data } = await axios.post(backendUrl + "/api/company/change-visibility", { id }, {
        headers: { token: companyToken },
      });
      if (data.success) {
        toast.success(data.message);
        fetchCompanyJobs();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (companyToken) fetchCompanyJobs();
  }, [companyToken]);

  if (isLoading) return <Loading />;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-6 min-h-screen bg-gray-50/50"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Manage Listings</h1>
          <p className="text-slate-500 mt-1 text-lg">Effortlessly control your active job openings</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/add-job")}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          <FiPlus className="text-xl" /> Post New Job
        </button>
      </div>

      {/* Modern Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard icon={<FiBriefcase/>} label="Total Jobs" value={jobs.length} color="indigo" />
        <StatCard icon={<FiCheckCircle/>} label="Active" value={jobs.filter(j => j.visible).length} color="emerald" />
        <StatCard icon={<FiUsers/>} label="Applicants" value={jobs.reduce((s, j) => s + (j.applicants || 0), 0)} color="blue" />
      </div>

      {/* Modern Table Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="py-5 px-8 text-xs font-bold text-slate-400 uppercase tracking-widest">Job Details</th>
                <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest max-sm:hidden">Metadata</th>
                <th className="py-5 px-6 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Candidates</th>
                <th className="py-5 px-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Visibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {jobs.map((job) => (
                <tr key={job._id} className="group hover:bg-indigo-50/30 transition-colors">
                  <td className="py-6 px-8">
                    <div className="font-bold text-slate-700 text-lg group-hover:text-indigo-600 transition-colors">{job.title}</div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                      <FiMapPin size={14} /> {job.location}
                    </div>
                  </td>
                  <td className="py-6 px-6 max-sm:hidden">
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <FiCalendar size={14} /> {moment(job.date).format("MMM DD, YYYY")}
                    </div>
                  </td>
                  <td className="py-6 px-6 text-center">
                    <span className="inline-flex items-center justify-center bg-slate-100 text-slate-600 font-bold px-4 py-1.5 rounded-full text-sm">
                      {job.applicants || 0}
                    </span>
                  </td>
                  <td className="py-6 px-8">
                    <div className="flex justify-center">
                      <ToggleButton 
                        checked={job.visible} 
                        onChange={() => changeJobVisiblity(job._id)} 
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

// Reusable StatCard Component
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
    <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600 text-2xl`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-400 font-medium text-sm uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-black text-slate-800">{value}</p>
    </div>
  </div>
);

// Custom Toggle
const ToggleButton = ({ checked, onChange }) => (
  <button 
    onClick={onChange}
    className={`w-14 h-7 flex items-center rounded-full p-1 transition-all duration-300 ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
  >
    <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-all duration-300 ${checked ? 'translate-x-7' : 'translate-x-0'}`} />
  </button>
);

export default ManageJobs;