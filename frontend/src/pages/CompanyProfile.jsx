import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import JobCard from "../components/JobCard";
import Loading from "../components/Loading";

const CompanyProfile = () => {
  const { id } = useParams();
  const { backendUrl, jobs } = useContext(AppContext);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/company/${id}`);
      if (data.success) {
        setCompanyData(data.company);
      } else {
        console.error("Backend Error:", data.message);
      }
    } catch (error) {
      console.error("Network Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCompanyData();
    }
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <h1 className="text-center mt-20">Loading... Please wait...</h1>;

  // Agar data nahi mila toh ye dikhayega, white screen nahi aayegi
  if (!companyData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Navbar />
        <p className="mt-20 text-gray-500">Company details not found or Invalid ID.</p>
        <Footer />
      </div>
    );
  }

  // Jobs filtering with safe checks
  const companyJobs = jobs ? jobs.filter(job => 
    job.companyId?._id === id || job.companyId === id
  ) : [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className='max-w-5xl mx-auto p-5 mt-10'>
        
        {/* Header Section */}
        <div className='flex flex-col md:flex-row items-center md:items-start gap-6 mb-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
          <img 
            src={companyData?.image || ""} 
            alt="company_logo" 
            className='w-32 h-32 rounded-xl shadow-md object-contain border bg-white' 
          />
          <div className="text-center md:text-left">
            <h1 className='text-4xl font-extrabold text-gray-900'>{companyData?.name || "Company Name"}</h1>
            <p className='text-blue-600 font-medium text-lg'>{companyData?.email || ""}</p>
          </div>
        </div>
        
        {/* About Section */}
        <div className='mb-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
          <h2 className='text-2xl font-bold mb-4 text-gray-800 border-b pb-2'>About Company</h2>
          <div 
            className='text-gray-700 leading-relaxed prose max-w-none'
            dangerouslySetInnerHTML={{ __html: companyData?.description || "No description available." }}
          ></div>
        </div>

        {/* Jobs Section */}
        <div className="mb-20">
          <h2 className='text-2xl font-bold mb-6 text-gray-800'>Current Openings</h2>
          {companyJobs.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {companyJobs.map((job, index) => (
                <JobCard key={index} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500">No active job openings.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CompanyProfile;