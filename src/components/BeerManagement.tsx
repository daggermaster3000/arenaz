"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { Beer } from "@/types";
import { supabase } from "@/lib/supabase";
import BeerEditor from "./BeerEditor";

export default function BeerManagement() {
  const [beers, setBeers] = useState<Beer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBeer, setEditingBeer] = useState<Beer | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBeers = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("beers").select("*").order("name");
    if (error) {
      console.error("BeerManagement fetch error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      setError(error.message);
    } else if (data) {
      setBeers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBeers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!supabase || !confirm("Are you sure you want to delete this beer?")) return;

    const { error } = await supabase.from("beers").delete().eq("id", id);
    if (!error) {
      fetchBeers();
    } else {
      alert("Error deleting beer: " + error.message);
    }
  };

  if (loading) {
    return <div className="py-8 text-center opacity-20"><Loader2 className="animate-spin mx-auto" size={24} /></div>;
  }

  return (
    <div className="beer-management">
      <div className="section-header">
        <h2 className="section-title">inventory management</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsAdding(true)}
        >
          <Plus size={14} />
          <span>add new beer</span>
        </button>
      </div>

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>beer</th>
              <th>style</th>
              <th>abv</th>
              <th className="text-right">actions</th>
            </tr>
          </thead>
          <tbody>
            {beers.map((beer) => (
              <tr key={beer.id}>
                <td>
                  <div className="beer-cell">
                    <img src={beer.label_url} alt={beer.name} className="admin-thumb" />
                    <span className="font-bold">{beer.name}</span>
                  </div>
                </td>
                <td>{beer.style}</td>
                <td>{beer.abv}%</td>
                <td className="text-right">
                  <div className="action-btns">
                    <button
                      className="btn-text"
                      onClick={() => setEditingBeer(beer)}
                      title="Edit beer"
                    >
                      <Edit2 size={14} />
                      <span>edit</span>
                    </button>
                    <button
                      className="btn-text danger"
                      onClick={() => handleDelete(beer.id)}
                      title="Remove beer"
                    >
                      <Trash2 size={14} />
                      <span>remove</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {beers.length === 0 && !error && (
          <p className="py-8 text-center opacity-30">no beers in database.</p>
        )}
      </div>

      {(isAdding || editingBeer) && (
        <BeerEditor
          beer={editingBeer}
          onClose={() => {
            setIsAdding(false);
            setEditingBeer(null);
          }}
          onSave={() => {
            fetchBeers();
            setIsAdding(false);
            setEditingBeer(null);
          }}
        />
      )}

      <style jsx>{`
        .beer-management {
          margin-top: var(--space-16);
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-6);
        }
        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          text-transform: lowercase;
        }
        .admin-beer-style {
          font-size: 0.75rem;
          opacity: 0.7;
          text-transform: lowercase;
        }
        
        .table-wrapper {
          border: 1px solid var(--border);
          background: var(--bg);
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .admin-table th {
          text-align: left;
          padding: var(--space-4);
          border-bottom: 2px solid var(--border);
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          opacity: 0.5;
        }
        .admin-table td {
          padding: var(--space-4);
          border-bottom: 1px solid var(--border);
        }
        .text-right { text-align: right; }
        
        .beer-cell {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        .font-bold { font-weight: 700; text-transform: lowercase; }
        
        .admin-thumb {
          width: 32px;
          height: 32px;
          object-fit: contain;
          background: var(--muted);
          border: 1px solid var(--border);
        }
        
        .action-btns {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-4);
        }
        
        .btn-text {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: lowercase;
          color: var(--fg);
          opacity: 0.8;
          transition: all 0.2s ease;
          padding: var(--space-1) 0;
          border-bottom: 1px solid transparent;
        }
        .icon-btn {
          padding: var(--space-2);
          opacity: 0.7;
          transition: all 0.2s ease;
        }
        .btn-text:hover {
          opacity: 1;
          border-bottom-color: currentColor;
        }
        .btn-text.danger:hover {
          color: #ff4d4d;
        }
        
        .btn-sm {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
        }
      `}</style>
    </div>
  );
}
