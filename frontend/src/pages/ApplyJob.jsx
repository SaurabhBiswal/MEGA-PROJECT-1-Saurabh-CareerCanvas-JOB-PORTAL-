import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Added useNavigate
import { AppContext } from "../context/AppContext";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import { assets } from "../assets/assets";
import kConvert from "k-convert";
import JobCard from "../components/JobCard";
import Footer from "../components/Footer";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/clerk-react";
import { FiMapPin, FiBriefcase, FiDollarSign, FiExternalLink } from "react-icons/fi";

const ApplyJob = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook for navigation
  const { getToken } = useAuth();
  const [jobData, setJobData] = useState(null);
  const [isAlreadyApplied, setAlreadyApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [resume, setResume] = useState(null);

  const {
    jobs = [],
    backendUrl,
    userData,
    fetchUserData,
    userApplications = [], // Default to empty array
    fetchUserApplications,
  } = useContext(AppContext);

  const fetchJob = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/jobs/${id}`);
      if (data.success) {
        setJobData(data.job);
        findSimilarJobs(data.job);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        toast.error(data.message);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to fetch job details.");
    }
  };

  const findSimilarJobs = (currentJob) => {
    const similar = jobs.filter(job => 
      job._id !== currentJob._id && 
      (job.companyId?._id === currentJob.companyId?._id || job.category === currentJob.category)
    ).slice(0, 4);
    setSimilarJobs(similar);
  };

  const applyHandler = async () => {
    try {
      if (!userData) return toast.error("Please login to apply.");

      const token = await getToken();
      setIsApplying(true);

      if (!userData.resume) {
        if (!resume) {
          setIsApplying(false);
          return toast.error("Please select a resume file first.");
        }

        const formData = new FormData();
        formData.append('resume', resume);

        const profileRes = await axios.post(`${backendUrl}/api/users/update-profile`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!profileRes.data.success) {
          setIsApplying(false);
          return toast.error("Resume upload failed.");
        }
        await fetchUserData();
      }

      const { data } = await axios.post(
        `${backendUrl}/api/users/apply`,
        { jobId: jobData?._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Application submitted successfully!");
        fetchUserApplications();
        setAlreadyApplied(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error applying.");
    } finally {
      setIsApplying(false);
    }
  };

  // FIXED: Added safe check for userApplications?.length
  const checkAlreadyApplied = () => {
    if (jobData && userApplications && userApplications.length > 0) {
      const hasApplied = userApplications.some((item) => item.jobId?._id === jobData._id);
      setAlreadyApplied(hasApplied);
    } else {
      setAlreadyApplied(false);
    }
  };

  useEffect(() => { if (id) fetchJob(); }, [id, backendUrl]);
  useEffect(() => { checkAlreadyApplied(); }, [jobData, userApplications]);

  if (isLoading || !jobData) return <Loading />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="flex items-start space-x-6">
                <div className="bg-white p-3 rounded-lg shadow-lg">
                  <img className="h-20 w-20 object-contain" src={jobData?.companyId?.image || assets.placeholder} alt="" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{jobData?.title}</h1>
                  <p className="text-xl text-blue-100 mt-1">{jobData?.companyId?.name}</p>
                  <div className="flex flex-wrap gap-4 mt-4 text-blue-100 text-sm">
                    <span className="flex items-center"><FiMapPin className="mr-1" /> {jobData?.location}</span>
                    <span className="flex items-center"><FiBriefcase className="mr-1" /> {jobData?.level}</span>
                    <span className="flex items-center"><FiDollarSign className="mr-1" /> {jobData?.salary ? kConvert.convertTo(jobData.salary) : "Competitive"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 p-6 rounded-xl border border-white/20 backdrop-blur-md">
                {!isAlreadyApplied && !userData?.resume && (
                  <div className="mb-4">
                    <label className="text-white text-sm font-medium mb-2 block">Upload Resume (Required)</label>
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx" 
                      onChange={(e) => setResume(e.target.files[0])}
                      className="text-sm text-blue-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-blue-700 hover:file:bg-blue-50"
                    />
                  </div>
                )}
                <button
                  onClick={applyHandler}
                  disabled={isAlreadyApplied || isApplying}
                  className={`w-full px-8 py-3 rounded-lg font-bold shadow-lg transition-all ${
                    isAlreadyApplied ? "bg-emerald-500 text-white cursor-default" : "bg-white text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {isApplying ? "Processing..." : isAlreadyApplied ? "Applied ✅" : "Apply Now"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3 space-y-8">
                    <div className="bg-white p-8 rounded-xl shadow-sm border">
                        <h2 className="text-2xl font-bold mb-4">Description</h2>
                        <div dangerouslySetInnerHTML={{__html: jobData.description}}></div>
                    </div>
                </div>
                <div className="lg:w-1/3 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="text-xl font-bold mb-3">About Company</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-4">{jobData.companyId?.description}</p>
                        
                        {/* FIXED: Added Navigation to Company Profile */}
                        <button 
                          onClick={() => {
                            navigate(`/company/${jobData.companyId?._id}`);
                            window.scrollTo(0,0);
                          }}
                          className="text-blue-600 font-medium flex items-center hover:underline"
                        >
                            View Profile <FiExternalLink className="ml-1"/>
                        </button>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-bold">Similar Jobs</h3>
                        {similarJobs.map(job => <JobCard key={job._id} job={job} />)}
                    </div>
                </div>
            </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ApplyJob;