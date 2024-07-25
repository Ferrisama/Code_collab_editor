import React from "react";
import CollaborativeEditor from "./CollaborativeEditor";
import LiveChat from "./LiveChat";

function ProjectPage({ user, project }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        {project.name}
      </h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-3/4">
          <CollaborativeEditor user={user} project={project} />
        </div>
        <div className="w-full md:w-1/4">
          <LiveChat user={user} projectId={project.id} />
        </div>
      </div>
    </div>
  );
}

export default ProjectPage;
