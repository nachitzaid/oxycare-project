import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PenLine } from "lucide-react";

interface SignatureInterventionProps {
  interventionId: number;
  signature: string | null;
  onSignatureChange: (nouvelleSignature: string) => void;
}

export function SignatureIntervention({ interventionId, signature, onSignatureChange }: SignatureInterventionProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!signature);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setHasSignature(true);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL('image/png');

    try {
      const response = await fetch(`/api/interventions/${interventionId}/signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signature: signatureData }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde de la signature');
      }

      onSignatureChange(signatureData);

      toast({
        title: "Succès",
        description: "La signature a été sauvegardée",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la signature",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Signature du technicien</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={clearSignature}>
            Effacer
          </Button>
          <Button onClick={saveSignature} disabled={!hasSignature}>
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        {signature ? (
          <div className="flex flex-col items-center space-y-4">
            <img
              src={signature}
              alt="Signature"
              className="max-w-full h-auto"
            />
            <Button variant="outline" onClick={clearSignature}>
              Modifier la signature
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              className="border rounded-lg cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <p className="text-sm text-gray-500">
              Signez dans la zone ci-dessus
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 