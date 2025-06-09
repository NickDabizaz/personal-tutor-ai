"use client";
import { useState } from "react";

export default function CreateCoursePage() {
  const [form, setForm] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = "Course name is required.";
    if (!form.description.trim()) newErrors.description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // For now, just log it
    console.log("Form submitted:", form);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-6 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl space-y-6 bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-800"
      >
        <h1 className="text-2xl font-bold text-white">Create a New Course</h1>

        <div>
          <label htmlFor="name" className="block mb-1 font-medium text-sm text-gray-300">
            Course Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="e.g. Intro to UI/UX Design"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block mb-1 font-medium text-sm text-gray-300">
            Course Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="What will this course cover? Who is it for?"
            value={form.description}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-300 transition"
        >
          Submit
        </button>
      </form>
    </main>
  );
}
