import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DashBoard.css";
import { SquarePen, Plus, Trash, X, Send } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import { Mic } from "lucide-react";

function MenuBar({ editor }) {
  if (!editor) return null;
  return (
    <div className="flex gap-2 mb-2 border-b pb-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={
          editor.isActive("bold") ? "bg-gray-300 px-2 rounded" : "px-2"
        }
      >
        <b>B</b>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={
          editor.isActive("italic") ? "bg-gray-300 px-2 rounded" : "px-2"
        }
      >
        <i>I</i>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={
          editor.isActive("underline") ? "bg-gray-300 px-2 rounded" : "px-2"
        }
      >
        <u>U</u>
      </button>
      <input
        type="color"
        onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
        className="w-8 h-8 p-0 border rounded cursor-pointer"
      />
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({
    totalCampaignsCount: 0,
    sentCampaignsCount: 0,
    draftCampaignsCount: 0,
    totalContacts: 0,
  });
  const [campaigns, setCampaigns] = useState([]);
  const [statusFilter, setStatusFilter] = useState("draft");
  const [createCampaign, setCreateCampaign] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [listening, setListening] = useState(false);

  const token = localStorage.getItem("token");
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, Underline],
    content: "",
  });

  function startListening() {
    if (!("webkitSpeechRecognition" in window)) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    setListening(true);

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setListening(false);

      try {
        const res = await axios.post(
          `${BASE_URL}/api/ai/analyzeSpeech`,
          { transcript },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { campaignName, subject, body } = res.data?.content;
        document.querySelector("input[name='name']").value = campaignName;
        document.querySelector("input[name='subject']").value = subject;
        editor.commands.setContent(body || "");
      } catch (err) {
        toast.error("Failed to process speech");
      }
    };

    recognition.onerror = (err) => {
      console.error(err);
      toast.error("Speech recognition error");
      setListening(false);
    };
  }

  async function fetchStats() {
    try {
      const res = await axios.get(`${BASE_URL}/api/campaign/getDashBoardData`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res && res.data && res.data.stats ? res.data.stats : stats);
    } catch (error) {}
  }

  async function fetchCampaigns() {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/campaign?status=${statusFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCampaigns(
        res && res.data && res.data.campaigns ? res.data.campaigns : []
      );
    } catch (error) {}
  }

  async function handleDelete(id) {
    try {
      await axios.delete(`${BASE_URL}/api/campaign/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCampaigns();
      toast.success("Campaign deleted.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete campaign");
    }
  }

  async function fetchContacts() {
    try {
      const res = await axios.get(`${BASE_URL}/api/contact`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(
        res && res.data && res.data.contacts ? res.data.contacts : []
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch contacts");
      setContacts([]);
    }
  }

  async function handleSendCampaign(campaignId) {
    setCampaigns((prev) => prev.filter((c) => c._id !== campaignId));
    try {
      await axios.post(
        `${BASE_URL}/api/campaign/send/${campaignId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.info("Campaign Started");
      if (statusFilter === "in-progress") {
        fetchCampaigns();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to start sending");
      fetchCampaigns();
    }
  }

  useEffect(() => {
    fetchStats();
    fetchCampaigns();
    fetchContacts();
    // eslint-disable-next-line
  }, [statusFilter]);

  return (
    <div className="dashboard-container bg-[#f9f9fc] min-h-screen px-8 py-6">
      <ToastContainer />
      <h2 className="text-3xl font-semibold mb-6 text-[#673de6]">Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          Total Campaigns: {stats.totalCampaignsCount}
        </div>
        <div className="stat-card">Sent: {stats.sentCampaignsCount}</div>
        <div className="stat-card">Draft: {stats.draftCampaignsCount}</div>
        <div className="stat-card">Total Contacts: {stats.totalContacts}</div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        {["draft", "in-progress", "sent", "failed"].map((status) => (
          <button
            key={status}
            className={`tab-btn ${statusFilter === status ? "active" : ""}`}
            onClick={() => setStatusFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} Campaigns
          </button>
        ))}
        <button
          className="btn contacts-btn flex items-center gap-2"
          onClick={() => setCreateCampaign(!createCampaign)}
        >
          <span>Create Campaign</span>
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {createCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setCreateCampaign(false)}
            >
              <X />
            </button>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const subject = e.target.subject.value;
                const name = e.target.name.value;
                const body = editor.getHTML();

                try {
                  await axios.post(
                    `${BASE_URL}/api/campaign`,
                    { subject, body, name, taggedContacts: selectedContacts },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  toast.success("Campaign created.");
                  setCreateCampaign(false);
                  fetchCampaigns();
                } catch (err) {
                  toast.error(
                    err?.response?.data?.message || "Failed to create campaign"
                  );
                }
              }}
            >
              <h3 className="text-lg font-semibold mb-4 text-[#673de6]">
                Create New Campaign
              </h3>

              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Campaign Name
                  </label>
                  <button
                    type="button"
                    onClick={startListening}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      listening ? "bg-red-100" : "bg-gray-100 hover:bg-gray-200"
                    } flex items-center gap-1`}
                    title="Speak your campaign idea"
                  >
                    <Mic
                      className={`w-5 h-5 transition-colors duration-200 ${
                        listening ? "text-red-500 animate-pulse" : "text-black"
                      }`}
                    />
                    {listening && (
                      <span className="text-red-500 text-sm font-medium">
                        Listening...
                      </span>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Body
                </label>
                <MenuBar editor={editor} />
                <div className="border p-2 rounded-md min-h-[150px] focus:outline-none">
                  <EditorContent
                    editor={editor}
                    className="focus:outline-none"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Contacts
                </label>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedContacts.length === contacts.length &&
                      contacts.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedContacts(
                          contacts.map((contact) => contact._id)
                        );
                      } else {
                        setSelectedContacts([]);
                      }
                    }}
                  />
                  <span className="text-gray-700">Select All</span>
                </div>

                <div className="h-40 overflow-y-auto border rounded-md p-2">
                  {contacts.length === 0 && (
                    <p className="text-gray-500">No contacts available</p>
                  )}
                  {contacts.map((contact) => (
                    <label
                      key={contact._id}
                      className="flex items-center space-x-2 mb-1"
                    >
                      <input
                        type="checkbox"
                        value={contact._id}
                        checked={selectedContacts.includes(contact._id)}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setSelectedContacts([...selectedContacts, value]);
                          } else {
                            setSelectedContacts(
                              selectedContacts.filter((id) => id !== value)
                            );
                          }
                        }}
                      />
                      <span>
                        {contact.name} ({contact.email})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn bg-[#673de6] text-white rounded-md w-full"
              >
                Save Campaign
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {campaigns.map((campaign) => (
          <div key={campaign._id} className="bg-white p-4 shadow-md rounded-md">
            <h3 className="text-xl font-semibold text-[#673de6]">
              Name: {campaign.name}
            </h3>
            <p className="text-gray-700">Subject: {campaign.subject}</p>
            <p className="text-gray-700">Body</p>
            <div
              className="text-gray-700"
              dangerouslySetInnerHTML={{ __html: campaign.body }}
            />
            <p className="mt-1">Status: {campaign.statusOfCampaign}</p>
            <p className="text-sm text-gray-500 mt-1">
              Tagged:{" "}
              {campaign.taggedContacts.length > 0
                ? campaign.taggedContacts.map((c) => c.email).join(", ")
                : "No contacts tagged"}
            </p>

            {campaign.statusOfCampaign === "draft" && (
              <div className="flex gap-3 mt-3">
                <SquarePen
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    (window.location.href = `/update-campaign/${campaign._id}`)
                  }
                />
                <Trash
                  style={{ cursor: "pointer" }}
                  onClick={() => handleDelete(campaign._id)}
                />
                <Send
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSendCampaign(campaign._id)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
