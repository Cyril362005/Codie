import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const projects = ['Project Alpha', 'Project Beta', 'Project Gamma'];

const ProjectSelector: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (project: string) => {
    setSelectedProject(project);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="w-full flex items-center justify-between p-md bg-white/5 rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedProject}</span>
        <FiChevronDown />
      </button>
      {isOpen && (
        <div className="absolute w-full mt-sm bg-secondary rounded-md shadow-lg">
          {projects.map((project) => (
            <button
              key={project}
              className="block w-full text-left px-md py-sm hover:bg-white/10"
              onClick={() => handleSelect(project)}
            >
              {project}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
