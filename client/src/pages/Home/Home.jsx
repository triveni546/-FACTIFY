import { useNavigate, Link } from "react-router-dom";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Sparkles,
  ShieldAlert,
  FileText,
  Image as ImageIcon,
  Mic,
  Send,
  X,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Globe,
  BarChart3,
  Play,
  Pause,
  ExternalLink,
} from "lucide-react";

import "../../styles/Home.css";
import { showBrowserNotification } from "../../utils/pushNotifications.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

const normalizeSourceUrl = (raw = "") => {
  let url = String(raw).trim().replace(/[.,;:!?)]+$/g, "");
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
};

const buildClientSourceLinks = (text = "", apiLinks = []) => {
  const links = [];
  const seen = new Set();

  const add = (label, rawUrl) => {
    const url = normalizeSourceUrl(rawUrl);
    if (!url) return;
    try {
      const href = new URL(url).href;
      if (seen.has(href)) return;
      seen.add(href);
      links.push({ label: label || href, url: href });
    } catch {
      // ignore invalid
    }
  };

  (Array.isArray(apiLinks) ? apiLinks : []).forEach((item) => {
    if (item?.url) add(item.label || item.url, item.url);
  });

  const matches = String(text).match(URL_REGEX) || [];
  matches.forEach((raw) => {
    const url = normalizeSourceUrl(raw);
    if (!url) return;
    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      add(host, url);
    } catch {
      add(raw, raw);
    }
  });

  return links;
};

const Home = ({ token: appToken, setToken: setAppToken }) => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [sourceCount, setSourceCount] = useState(0);
  const [claimCount, setClaimCount] = useState(0);
  const [riskLevel, setRiskLevel] = useState("Pending");
  const [confidence, setConfidence] = useState(0);
  const [riskScore, setRiskScore] = useState(0);
  const [resultLabel, setResultLabel] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [explanations, setExplanations] = useState([
    "Enter text above and click analyze to get AI-powered results.",
  ]);
  const [extractedText, setExtractedText] = useState("");
  const [rewriteText, setRewriteText] = useState(
    "Run an analysis to receive a share-safe summary and verification guidance."
  );
  const [sourceLinks, setSourceLinks] = useState([]);
  const [sourceLinksOpen, setSourceLinksOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [fabOpen, setFabOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState(null);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedVoice, setUploadedVoice] = useState([]);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const attachMenuRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioRefs = useRef({});

  const syncAuthState = () => {
    try {
      const storedToken = (localStorage.getItem("token") || appToken || "").trim();
      setIsLoggedIn(Boolean(storedToken));
      return storedToken;
    } catch {
      setIsLoggedIn(false);
      return "";
    }
  };

  useEffect(() => {
    syncAuthState();
  }, [appToken]);

  useEffect(() => {
    const onStorage = () => syncAuthState();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onStorage);
    };
  }, [appToken]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        attachMenuRef.current &&
        !attachMenuRef.current.contains(event.target)
      ) {
        setFabOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      uploadedImages.forEach((img) => {
        if (img?.preview) URL.revokeObjectURL(img.preview);
      });

      uploadedVoice.forEach((audio) => {
        if (audio?.preview) URL.revokeObjectURL(audio.preview);
        const el = audioRefs.current[audio.id];
        if (el) {
          el.pause();
          el.src = "";
        }
      });

      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioRefs.current = {};
    };
  }, [uploadedImages, uploadedVoice]);

  const hasContent =
    inputValue.trim().length > 0 ||
    uploadedImages.length > 0 ||
    uploadedFiles.length > 0 ||
    uploadedVoice.length > 0;

  const clearUploads = () => {
    uploadedImages.forEach((img) => {
      if (img?.preview) URL.revokeObjectURL(img.preview);
    });
    uploadedVoice.forEach((audio) => {
      if (audio?.preview) URL.revokeObjectURL(audio.preview);
    });
    setUploadedFiles([]);
    setUploadedImages([]);
    setUploadedVoice([]);
  };

  const applyAnalysisResult = (data, analyzedText = "") => {
    const result = (data?.result || data?.verdict || "").toLowerCase();
    const mentionsList = Array.isArray(data?.trusted_mentions)
      ? data.trusted_mentions
      : Array.isArray(data?.trustedEntityList)
        ? data.trustedEntityList
        : [];

    const domainList = Array.isArray(data?.trustedSources)
      ? data.trustedSources
      : Array.isArray(data?.trustedSourceList)
        ? data.trustedSourceList
        : [];

    const claimsList = Array.isArray(data?.claims)
      ? data.claims
      : Array.isArray(data?.extractedClaims)
        ? data.extractedClaims
        : [];

    const explanationList = Array.isArray(data?.explanations)
      ? data.explanations
      : [];

    const confidenceValue = Number(data?.confidence) || 0;
    const level = data?.riskLevel || "Low";

    setResultLabel(result);
    setRiskLevel(level);
    setConfidence(confidenceValue);
    setSourceCount(mentionsList.length + domainList.length);
    setClaimCount(
      Number(data?.claimsExtracted) >= 0
        ? Number(data.claimsExtracted)
        : claimsList.length
    );
    const calculatedRisk =
      result === "real"
        ? Math.max(5, 100 - confidenceValue)
        : confidenceValue;

    setRiskScore(Math.round(calculatedRisk));
    setRewriteText(
      data?.rewriteSuggestion || "No rewrite suggestion available."
    );
    setExplanations(
      explanationList.length > 0
        ? explanationList
        : ["Analysis completed successfully."]
    );
    setExtractedText(data?.extractedText ? String(data.extractedText) : "");
    setSourceLinks(
      buildClientSourceLinks(
        analyzedText || inputValue.trim() || data?.extractedText || "",
        data?.source_links
      )
    );
    setSourceLinksOpen(false);
    setHasAnalyzed(true);

    if (data?.pushNotification) {
      showBrowserNotification(data.pushNotification);
    }
  };

  const handleAuthFailure = (message) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (setAppToken) {
      setAppToken(null);
    }
    setIsLoggedIn(false);
    setShowError(true);
    setErrorMessage(message || "Session expired. Please log in again.");
    navigate("/login", { state: { from: { pathname: "/" } } });
  };

  const handleAnalyze = async () => {
    const authToken = syncAuthState();

    if (!authToken) {
      handleAuthFailure("Please log in to analyze content.");
      return;
    }

    if (!hasContent) {
      setShowError(true);
      setErrorMessage("Please enter text or upload content");
      return;
    }

    try {
      setShowError(false);
      setErrorMessage("");
      setIsLoading(true);

      const value = inputValue.trim();
      const formData = new FormData();

      if (value) {
        formData.append("data", value);
      }

      if (/^https?:\/\//i.test(value)) {
        formData.append("type", "url");
        formData.append("url", value);
      } else if (value) {
        formData.append("type", "text");
      }

      uploadedFiles.forEach((item) => {
        formData.append("files", item.file);
      });

      uploadedImages.forEach((item) => {
        formData.append("images", item.file);
      });

      uploadedVoice.forEach((item) => {
        formData.append("voice", item.file);
      });

      const response = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.status === 401) {
        handleAuthFailure(
          data.message === "No token"
            ? "You are not logged in. Please sign in to analyze content."
            : data.message === "Token failed"
              ? "Your session expired. Please log in again."
              : data.message || "Session expired. Please log in again."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Prediction failed");
      }

      applyAnalysisResult(data, value);
      clearUploads();
    } catch (error) {
      console.log(error);
      setShowError(true);
      setErrorMessage(error.message || "Prediction failed");
      setExplanations([error.message || "Prediction failed"]);
      setHasAnalyzed(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type,
    }));

    if (
      uploadedFiles.length +
        uploadedImages.length +
        uploadedVoice.length +
        files.length >
      10
    ) {
      setShowError(true);
      setErrorMessage("Upload limit exceeded (max 10 files)");
      return;
    }

    setShowError(false);
    setErrorMessage("");
    setUploadedFiles((prev) => [...prev, ...files]);
    e.target.value = "";
    setFabOpen(false);
  };

  const handleImageUpload = (e) => {
    const images = Array.from(e.target.files || []).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type,
      preview: URL.createObjectURL(file),
    }));

    if (
      uploadedFiles.length +
        uploadedImages.length +
        uploadedVoice.length +
        images.length >
      10
    ) {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setShowError(true);
      setErrorMessage("Upload limit exceeded (max 10 files)");
      return;
    }

    setShowError(false);
    setErrorMessage("");
    setUploadedImages((prev) => [...prev, ...images]);
    e.target.value = "";
    setFabOpen(false);
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Microphone not supported in this browser");
        return;
      }

      const totalUploads =
        uploadedFiles.length + uploadedImages.length + uploadedVoice.length;

      if (totalUploads >= 10) {
        setShowError(true);
        setErrorMessage("Upload limit exceeded (max 10 files)");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const preview = URL.createObjectURL(blob);

        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: "audio/webm",
        });

        setUploadedVoice((prev) => [
          ...prev,
          {
            id: `voice-${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            type: file.type,
            preview,
          },
        ]);

        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setFabOpen(false);
      setShowError(false);
      setErrorMessage("");
    } catch (err) {
      console.log(err);
      alert(
        "Microphone permission blocked. Please allow microphone access in Chrome settings."
      );
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const toggleAudioPlayback = (id) => {
    const currentAudio = audioRefs.current[id];
    if (!currentAudio) return;

    if (playingAudioId === id) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setPlayingAudioId(null);
      return;
    }

    Object.entries(audioRefs.current).forEach(([audioId, audioEl]) => {
      if (audioEl && audioId !== id) {
        audioEl.pause();
        audioEl.currentTime = 0;
      }
    });

    currentAudio.play();
    setPlayingAudioId(id);
  };

  const removeItem = (id, type) => {
    if (type === "file") {
      setUploadedFiles((prev) => prev.filter((item) => item.id !== id));
    }

    if (type === "image") {
      const item = uploadedImages.find((image) => image.id === id);
      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
      }
      setUploadedImages((prev) => prev.filter((item) => item.id !== id));
    }

    if (type === "voice") {
      const item = uploadedVoice.find((audio) => audio.id === id);
      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
      }
      setUploadedVoice((prev) => prev.filter((item) => item.id !== id));
      delete audioRefs.current[id];
      if (playingAudioId === id) {
        setPlayingAudioId(null);
      }
    }
  };

  const displayRiskLabel = useMemo(() => {
    if (!hasAnalyzed) return "Ready to Analyze";
    if (riskLevel === "High") return "Likely False";
    if (riskLevel === "Low") return "Likely Credible";
    return "Needs Verification";
  }, [hasAnalyzed, riskLevel]);

  const previewSourceLinks = useMemo(
    () => buildClientSourceLinks(inputValue.trim()),
    [inputValue]
  );

  const activeSourceLinks = hasAnalyzed ? sourceLinks : previewSourceLinks;

  const handleSourceLinksClick = () => {
    if (activeSourceLinks.length === 0) {
      alert(
        hasAnalyzed
          ? "No source links found. Paste a URL or mention a trusted outlet in your text."
          : "Paste a URL in the box above, or run Analyze to detect source links."
      );
      return;
    }

    if (activeSourceLinks.length === 1) {
      window.open(activeSourceLinks[0].url, "_blank", "noopener,noreferrer");
      return;
    }

    setSourceLinksOpen((prev) => !prev);
  };

  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-left">
          <div className="hero-badge">
            <Sparkles size={16} />
            AI-Powered Fake News Detection
          </div>

          <h1>
            Detect misinformation
            <span> before it spreads</span>
          </h1>

          <p>
            Paste articles, upload screenshots, documents, or voice clips and
            get instant AI-powered credibility analysis with evidence-backed
            insights
          </p>

          <div className="hero-tags">
            <div className="hero-tag">Real-time Analysis</div>
            <div className="hero-tag">AI Claim Detection</div>
            <div className="hero-tag">Source Verification</div>
          </div>
        </div>

        <div className="hero-right">
          <div className="floating-card">
            <ShieldAlert size={22} />
            <div>
              <strong>
                {hasAnalyzed
                  ? riskLevel === "Low"
                    ? `${riskScore}% Risk Score`
                    : `${riskScore}% Risk Detected`
                  : "Ready to Analyze"}
              </strong>
              <p>
                {hasAnalyzed
                  ? `${riskLevel} risk | Verdict: ${resultLabel || "pending"}`
                  : "Paste content to start"}
              </p>
            </div>
          </div>

          <div className="floating-card">
            <CheckCircle2 size={22} />
            <div>
              <strong>{sourceCount} Trusted Sources</strong>
              <p>Cross verified with reliable reports</p>
            </div>
          </div>
        </div>
      </section>

      <section className="analyzer-card">
        <div className="analyzer-header">
          <div>
            <h2>Analyze Content</h2>
            <p>Paste suspicious content or upload supporting files</p>
          </div>

          <div className="char-count">{inputValue.length}/2000</div>
        </div>

        <div className={`textarea-box ${showError ? "textarea-error" : ""}`}>
          <textarea
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (showError) setShowError(false);
              if (errorMessage) setErrorMessage("");
            }}
            maxLength={2000}
            placeholder="Paste article text, headline, or suspicious claim here..."
          />
        </div>

        <div className="analyzer-toolbar">
          <div className="action-bar">
            <div className="left-actions" ref={attachMenuRef}>
              <button
                className="action-btn"
                onClick={() => setFabOpen((prev) => !prev)}
                type="button"
                aria-expanded={fabOpen}
                aria-label="Upload files or images"
              >
                +
              </button>

              {fabOpen && (
                <div className="attach-dropdown">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileText size={15} />
                    Upload Files
                  </button>

                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <ImageIcon size={15} />
                    Upload Images
                  </button>
                </div>
              )}
            </div>

            <div className="right-actions">
              <button
                className={`mic-button ${isRecording ? "recording" : ""}`}
                onClick={handleMicClick}
                type="button"
                aria-label="Record voice"
              >
                <Mic size={18} />
              </button>

              <button
                className="send-button"
                onClick={handleAnalyze}
                disabled={isLoading || !hasContent}
                type="button"
                aria-label="Analyze content"
              >
                {isLoading ? <div className="loader"></div> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
        />

        <input
          ref={imageInputRef}
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={handleImageUpload}
        />

        {(uploadedFiles.length > 0 ||
          uploadedImages.length > 0 ||
          uploadedVoice.length > 0) && (
          <div className="upload-preview">
            {uploadedFiles.map((file) => (
              <div className="upload-chip" key={file.id}>
                <div className="upload-chip-left">
                  <FileText size={14} />
                  <span>{file.name}</span>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(file.id, "file")}
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {uploadedImages.map((image) => (
              <div className="upload-image-card" key={image.id}>
                <img src={image.preview} alt={image.name} />
                <div className="upload-image-meta">
                  <div className="upload-image-top">
                    <div className="upload-image-name">
                      <ImageIcon size={14} />
                      <span>{image.name}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(image.id, "image")}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <small>{image.size}</small>
                </div>
              </div>
            ))}

            {uploadedVoice.map((audio) => (
              <div className="voice-preview-card" key={audio.id}>
                <div className="voice-preview-left">
                  <button
                    type="button"
                    className="voice-play-btn"
                    onClick={() => toggleAudioPlayback(audio.id)}
                  >
                    {playingAudioId === audio.id ? (
                      <Pause size={14} />
                    ) : (
                      <Play size={14} />
                    )}
                  </button>

                  <div>
                    <div className="voice-file-name">{audio.name}</div>
                    <small>{audio.size}</small>
                  </div>
                </div>

                <button
                  type="button"
                  className="voice-remove-btn"
                  onClick={() => removeItem(audio.id, "voice")}
                >
                  <X size={14} />
                </button>

                <audio
                  ref={(el) => {
                    if (el) {
                      audioRefs.current[audio.id] = el;
                      el.onended = () => setPlayingAudioId(null);
                    }
                  }}
                  src={audio.preview}
                  preload="metadata"
                />
              </div>
            ))}
          </div>
        )}

        {showError && errorMessage && (
          <div className="error-message">
            <AlertTriangle size={16} />
            {errorMessage}
          </div>
        )}
      </section>

      {hasAnalyzed && extractedText && (
        <section className="ai-explain-box">
          <h3>Extracted Text from Upload</h3>
          <p className="extracted-text-block">{extractedText}</p>
        </section>
      )}

      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-icon cyan">
            <Globe size={20} />
          </div>

          <div>
            <h3>{hasAnalyzed ? sourceCount : "—"}</h3>
            <p>Trusted Sources</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Brain size={20} />
          </div>

          <div>
            <h3>{hasAnalyzed ? claimCount : "—"}</h3>
            <p>Claims Extracted</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <BarChart3 size={20} />
          </div>

          <div>
            <h3>{hasAnalyzed ? riskLevel : "—"}</h3>
            <p>
              {hasAnalyzed
                ? `Risk Level (${confidence}% risk score)`
                : "Risk Level"}
            </p>
          </div>
        </div>
      </section>

      <section className="result-section">
        <div className="result-left">
          <div className="result-badge">{displayRiskLabel}</div>

          <h2>AI Verdict Summary</h2>

          <p>
            {!hasAnalyzed
              ? "Paste content above and run Analyze to get an AI verdict, risk score, and source links."
              : riskLevel === "Low"
                ? "Content aligns with reports from trusted organizations. No significant misinformation indicators detected by AI analysis."
                : riskLevel === "High"
                  ? "Content contains clickbait patterns, unsupported claims, or misinformation indicators detected by AI."
                  : "Content requires additional verification. Mixed or insufficient signals detected."}
          </p>

          {sourceLinksOpen && activeSourceLinks.length > 0 && (
            <div className="source-link-list verdict-source-links">
              {activeSourceLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-link-btn"
                >
                  <ExternalLink size={15} />
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          )}

          <div className="result-actions">
            <button
              type="button"
              onClick={() => {
                if (!hasAnalyzed) {
                  alert(
                    "Run Analyze first to view AI evidence for your content."
                  );
                  return;
                }
                alert(explanations.join("\n\n"));
              }}
            >
              View Evidence
            </button>

            <button type="button" onClick={handleSourceLinksClick}>
              Source Links
            </button>
          </div>
        </div>

        <div
          className="score-circle"
          style={{
            background: `conic-gradient(
              #06b6d4 0deg,
              #06b6d4 ${riskScore * 3.6}deg,
              rgba(30, 41, 59, 0.9) ${riskScore * 3.6}deg,
              rgba(30, 41, 59, 0.9) 360deg
            )`,
          }}
        >
          <div className="score-inner">
            <h1>{riskScore}%</h1>
            <span>Risk Score</span>
          </div>
        </div>
      </section>

      <section className="ai-explain-box">
        <h3>Why AI Flagged This Content</h3>

        <div className="explain-list">
          {explanations.map((item, index) => (
            <div className="explain-item" key={index}>
              {item}
            </div>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-glow footer-glow-1"></div>
        <div className="footer-glow footer-glow-2"></div>

        <div className="footer-inner">
          <div className="footer-brand">
            <h3>FACTIFY</h3>
            <p>
              Smarter fake news detection with clean insights, fast checks, and
              reliable monitoring.
            </p>
          </div>

          <div className="footer-links-wrap">
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 FACTIFY. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
};

export default Home;
