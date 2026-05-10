"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Upload, Loader2, Save } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Beer } from "@/types";

interface BeerEditorProps {
    beer?: Beer | null;
    onClose: () => void;
    onSave: () => void;
}

export default function BeerEditor({ beer, onClose, onSave }: BeerEditorProps) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const supabase = createClient();

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
        if (!file) return;

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
                                    <Image
                                        src={formData.label_url}
                                        alt="Preview"
                                        className="preview-img"
                                        fill
                                        sizes="240px"
                                    />
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
        </div>
    );
}
