import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useContext(UserContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState([]);

  const navigate = useNavigate();

  const createProject = (e) => {
    e.preventDefault();

    axios
      .post("/projects/create", {
        name: projectName,
      })
      .then((res) => {
        setProject((prev) => [...prev, res.data.project]);
        setProjectName("");
        setIsModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("/projects/all")
      .then((res) => {
        setProject(res.data.projects);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [navigate]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4 md:p-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-6 md:p-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-slate-800">
                Welcome Back 👋
              </h1>

              <p className="text-slate-500 mt-3 text-sm md:text-base">
                Manage your AI-powered chatbot collaboration projects from one
                place.
              </p>

              <div className="mt-4 inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm">
                <i className="ri-user-line"></i>
                {user?.email}
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:scale-105 transition-all duration-300"
            >
              <i className="ri-add-line mr-2"></i>
              New Project
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h3 className="text-slate-500 text-sm">Total Projects</h3>
            <p className="text-4xl font-bold text-blue-600 mt-2">
              {project.length}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h3 className="text-slate-500 text-sm">Collaborators</h3>
            <p className="text-4xl font-bold text-indigo-600 mt-2">
              {project.reduce((acc, p) => acc + p.users.length, 0)}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h3 className="text-slate-500 text-sm">Workspace Status</h3>
            <p className="text-4xl font-bold text-green-600 mt-2">Active</p>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="max-w-7xl mx-auto">
        {project.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 shadow-lg text-center">
            <div className="text-7xl mb-4">🤖</div>

            <h2 className="text-2xl font-bold text-slate-800">
              No Projects Yet
            </h2>

            <p className="text-slate-500 mt-2">
              Create your first AI chatbot collaboration workspace.
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {project.map((project) => (
              <div
                key={project._id}
                onClick={() =>
                  navigate("/project", {
                    state: { project },
                  })
                }
                className="group cursor-pointer bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-white"
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                    {project.name.charAt(0).toUpperCase()}
                  </div>

                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                    Active
                  </span>
                </div>

                <h2 className="font-bold text-xl text-slate-800 mb-4 capitalize">
                  {project.name}
                </h2>

                <div className="flex items-center justify-between">
                  <p className="text-slate-500 flex items-center gap-2">
                    <i className="ri-team-line"></i>
                    {project.users.length} Members
                  </p>

                  <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-all">
                    Open →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-[fadeIn_.3s_ease]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Create Project
              </h2>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-red-500"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <form onSubmit={createProject}>
              <input
                type="text"
                placeholder="Enter project name..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 py-3 rounded-2xl font-medium hover:bg-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl font-medium"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
