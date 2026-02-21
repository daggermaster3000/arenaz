"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, Loader2, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Beer } from "@/types";

interface BeerEditorProps {
    beer?: Beer | null;
    onClose: () => void;
    onSave: () => void;
}

export default function BeerEditor({ beer, onClose, onSave }: BeerEditorProps) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState<Partial<Beer>>({
        id: "",
        name: "",
        style: "",
        abv: 5.0,
        description: "",
        label_url: "",
        scientific_profile: {
            appearance: "",
            aroma: "",
            flavor: "",
            mouthfeel: "",
            bubbles: ""
        }
    });

    useEffect(() => {
        if (beer) {
            setFormData(beer);
        } else {
            // Generate a random ID for new beers if not provided
            setFormData(prev => ({ ...prev, id: Math.random().toString(36).substring(2, 9) }));
        }
    }, [beer]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !supabase) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `labels/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('beer-labels')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('beer-labels')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, label_url: publicUrl }));
        } catch (error: any) {
            alert("Error uploading image: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('beers')
                .upsert(formData);

            if (error) throw error;
            onSave();
            onClose();
        } catch (error: any) {
            alert("Error saving beer: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="overlay" onClick={onClose}>
            <div className="overlay-content editor-modal" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                <h2 className="editor-title">{beer ? "edit beer" : "add new beer"}</h2>

                <form onSubmit={handleSubmit} className="editor-form">
                    <div className="form-grid">
                        <div className="image-col">
                            <div className="image-preview-box">
                                {formData.label_url ? (
                                    <img src={formData.label_url} alt="Preview" className="preview-img" />
                                ) : (
                                    <div className="preview-placeholder">
                                        <Upload size={32} opacity={0.2} />
                                        <span>no image</span>
                                    </div>
                                )}
                            </div>
                            <label className="upload-btn">
                                {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                <span>{uploading ? "uploading..." : "upload label"}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                    disabled={uploading}
                                />
                            </label>
                        </div>

                        <div className="fields-col">
                            <div className="form-row">
                                <div className="field">
                                    <label>id (unique identifier)</label>
                                    <input
                                        type="text"
                                        value={formData.id}
                                        onChange={e => setFormData({ ...formData, id: e.target.value })}
                                        disabled={!!beer}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="field">
                                    <label>name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label>style</label>
                                    <input
                                        type="text"
                                        value={formData.style}
                                        onChange={e => setFormData({ ...formData, style: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="field">
                                    <label>abv (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.abv}
                                        onChange={e => setFormData({ ...formData, abv: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="field">
                                <label>description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="scientific-fields">
                        <h3 className="section-label">scientific profile</h3>
                        <div className="profile-grid">
                            {Object.keys(formData.scientific_profile || {}).map(key => (
                                <div key={key} className="field">
                                    <label>{key}</label>
                                    <textarea
                                        value={(formData.scientific_profile as any)[key]}
                                        onChange={e => setFormData({
                                            ...formData,
                                            scientific_profile: {
                                                ...formData.scientific_profile,
                                                [key]: e.target.value
                                            } as any
                                        })}
                                        rows={2}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            <span>save beer</span>
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.8);
                    backdrop-filter: blur(4px);
                    z-index: 200;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: var(--space-4);
                }
                .editor-modal {
                    background: var(--bg);
                    border: 1px solid var(--border);
                    padding: var(--space-10);
                    position: relative;
                    width: 100%;
                    max-width: 900px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                }
                .editor-title {
                    font-size: 2rem;
                    font-weight: 800;
                    text-transform: lowercase;
                    margin-bottom: var(--space-8);
                }
                .form-grid {
                    display: grid;
                    gap: var(--space-8);
                    margin-bottom: var(--space-8);
                }
                @media (min-width: 768px) {
                    .form-grid { grid-template-columns: 240px 1fr; }
                }
                .image-preview-box {
                    aspect-ratio: 1;
                    background: var(--muted);
                    border: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: var(--space-4);
                    overflow: hidden;
                }
                .preview-img { width: 100%; height: 100%; object-fit: contain; }
                .preview-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--space-2);
                    opacity: 0.6;
                    font-size: 0.75rem;
                }
                .upload-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-2);
                    padding: var(--space-3);
                    background: var(--fg);
                    color: var(--bg);
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    cursor: pointer;
                }
                
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4); }
                .field { margin-bottom: var(--space-4); }
                .field label {
                    display: block;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    opacity: 0.8;
                    font-weight: 700;
                    margin-bottom: var(--space-2);
                }
                input, textarea {
                    width: 100%;
                    padding: var(--space-3);
                    background: var(--bg);
                    border: 1px solid var(--border);
                    color: var(--fg);
                    font-family: inherit;
                    font-size: 0.875rem;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                input:focus, textarea:focus { 
                    border-color: var(--accent); 
                    box-shadow: 0 0 0 2px rgba(0,0,0,0.05);
                    outline: none; 
                }
                
                .scientific-fields {
                    border-top: 1px solid var(--border);
                    padding-top: var(--space-8);
                    margin-bottom: var(--space-8);
                }
                .section-label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    opacity: 0.8;
                    margin-bottom: var(--space-6);
                }
                .profile-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: var(--space-4);
                }
                
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: var(--space-4);
                    padding-top: var(--space-6);
                    border-top: 1px solid var(--border);
                }
                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--space-2);
                    padding: var(--space-3) var(--space-6);
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    cursor: pointer;
                }
                .btn-primary { background: var(--accent); color: var(--bg); border: none; }
                .btn-secondary { background: none; border: 1px solid var(--border); color: var(--fg); }
                .close-btn { position: absolute; top: 1rem; right: 1rem; opacity: 0.6; }
                .close-btn:hover { opacity: 1; }
            `}</style>
        </div>
    );
}
