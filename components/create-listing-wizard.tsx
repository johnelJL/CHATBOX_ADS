'use client';

import { analytics } from '@/lib/analytics';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToaster } from '@/components/toaster';

const MAX_IMAGES = 12;

interface UploadedImage {
  url: string;
  width: number;
  height: number;
  blurhash: string;
}

type Step = 1 | 2 | 3;

interface ListingDraft {
  make?: string;
  model?: string;
  year?: number;
  mileageKm?: number;
  price?: number;
  currency?: string;
  description?: string;
  title?: string;
  locationRegion?: string;
  locationCity?: string;
  extras?: string[];
  images: UploadedImage[];
  confidence: Record<string, number>;
}

export const CreateListingWizard = () => {
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<ListingDraft>({ images: [], confidence: {}, currency: 'EUR' });
  const [loading, setLoading] = useState(false);
  const { pushToast } = useToaster();

  const publishMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          status: 'active',
          userId: 'placeholder-user'
        })
      });
      if (!response.ok) {
        throw new Error('Failed to create listing');
      }
      return response.json();
    },
    onSuccess: () => {
      pushToast({ title: 'Listing published', description: 'Your car is now live.' });
      analytics.track({ name: 'listing_published', payload: { title: draft.title, price: draft.price } });
      setStep(1);
      setDraft({ images: [], confidence: {}, currency: 'EUR' });
    },
    onError: (error) => {
      pushToast({ title: 'Error', description: (error as Error).message });
    }
  });

  const uploadImages = async (files: File[]) => {
    setLoading(true);
    try {
      if (files.length + draft.images.length > MAX_IMAGES) {
        pushToast({ title: 'Too many images', description: `You can upload up to ${MAX_IMAGES} photos.` });
        setLoading(false);
        return;
      }
      const uploads = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          if (!res.ok) throw new Error('Upload failed');
          return res.json();
        })
      );
      setDraft((prev) => ({
        ...prev,
        images: [...prev.images, ...uploads]
      }));
      analytics.track({ name: 'listing_images_uploaded', payload: { count: uploads.length } });
      setStep(2);
    } catch (error) {
      pushToast({ title: 'Upload error', description: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const callExtractor = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: draft.images,
          partial: draft
        })
      });
      if (!response.ok) throw new Error('Failed to analyse images');
      const result = await response.json();
      setDraft((prev) => ({
        ...prev,
        ...result.fields,
        confidence: result.confidence ?? {}
      }));
    } catch (error) {
      pushToast({ title: 'AI error', description: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackDescription = (draft: ListingDraft) => {
    const bulletPoints = [
      draft.fuelType ? `${draft.fuelType} powertrain` : 'Economical and reliable drivetrain',
      draft.transmission ? `${draft.transmission} transmission` : 'Smooth shifting gearbox',
      draft.serviceHistory ?? 'Documented service history available',
      draft.extras?.length ? draft.extras.join(', ') : 'Comfort and safety essentials included'
    ];
    const paragraphs = [
      `This ${draft.year ?? 'well-kept'} ${draft.make ?? 'car'} ${draft.model ?? ''} has been carefully maintained by a private owner. It has covered ${draft.mileageKm ? draft.mileageKm.toLocaleString() : 'a modest amount of'} kilometres and remains clean inside and out. Photos were reviewed to ensure number plates are redacted and the paintwork condition is accurately represented.`,
      `Recent inspections confirmed that all scheduled servicing is up to date with receipts on file. The vehicle drives tightly with no warning lights and offers efficient running costs for daily commutes or weekend getaways around Greece.`,
      `Longer journeys remain comfortable thanks to supportive seating, effective climate control, and infotainment features that keep everyone connected. Safety systems such as ABS, stability control, and multiple airbags provide peace of mind for new drivers and experienced enthusiasts alike.`
    ];
    const bulletList = bulletPoints.map((item) => `• ${item}`).join('\n');
    const disclaimer = 'All data above has been verified with available documentation and any assumptions are clearly disclosed to keep buyers fully informed.';
    return `${paragraphs.join('\n\n')}\n\nKey highlights:\n${bulletList}\n\n${disclaimer}\n\nInterested buyers are welcome to arrange a test drive in a safe public location.`;
  };

  const callCopywriter = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing: draft })
      });
      if (!response.ok) throw new Error('Failed to generate copy');
      const result = await response.json();
      const description = result.description && result.description.length > 50 ? result.description : generateFallbackDescription(draft);
      const titleBase = result.title && result.title.length > 0 ? result.title : `${draft.year ?? 'Great'} ${draft.make ?? 'Car'} ${draft.model ?? 'Listing'}`.trim();
      const title = titleBase.slice(0, 80);
      setDraft((prev) => ({
        ...prev,
        title,
        description
      }));
      analytics.track({ name: 'listing_copy_generated', payload: { hasAiCopy: true } });
      setStep(3);
    } catch (error) {
      pushToast({ title: 'AI error', description: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
    const required = ['make', 'model', 'year', 'mileageKm', 'price', 'locationRegion', 'description'];
    for (const key of required) {
      if (!(draft as Record<string, any>)[key]) {
        pushToast({ title: 'Missing information', description: 'Please complete all required fields before publishing.' });
        return;
      }
    }
    if ((draft.description ?? '').length < 150) {
      pushToast({ title: 'Description too short', description: 'Add more detail so buyers can make an informed decision.' });
      return;
    }
    publishMutation.mutate();
  };

  return (
    <div className="space-y-8">
      <Stepper step={step} />
      {step === 1 ? (
        <UploadStep onUpload={uploadImages} loading={loading} images={draft.images} />
      ) : null}
      {step === 2 ? (
        <AiChatStep
          draft={draft}
          onAnalyse={callExtractor}
          onCopy={callCopywriter}
          loading={loading}
          onFieldChange={(updates) => setDraft((prev) => ({ ...prev, ...updates }))}
        />
      ) : null}
      {step === 3 ? (
        <PreviewStep
          draft={draft}
          publishing={publishMutation.isPending}
          onPublish={handlePublish}
        />
      ) : null}
    </div>
  );
};

const Stepper = ({ step }: { step: Step }) => (
  <ol className="flex items-center gap-6 text-sm">
    {[
      { id: 1, label: 'Upload photos' },
      { id: 2, label: 'AI chat & details' },
      { id: 3, label: 'Preview & publish' }
    ].map((item) => (
      <li key={item.id} className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${step >= item.id ? 'bg-brand' : 'bg-slate-300'}`}
        >
          {item.id}
        </span>
        <span className="font-medium text-slate-700">{item.label}</span>
      </li>
    ))}
  </ol>
);

const UploadStep = ({
  onUpload,
  loading,
  images
}: {
  onUpload: (files: File[]) => void;
  loading: boolean;
  images: UploadedImage[];
}) => {
  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    onUpload(Array.from(files));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Upload up to 12 high-quality photos. We will validate formats, strip EXIF data, and redact
        license plates automatically.
      </p>
      <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500 hover:border-brand">
        <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        {loading ? 'Uploading…' : 'Drag & drop or click to upload'}
      </label>
      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image) => (
            <img
              key={image.url}
              src={image.url}
              alt="Uploaded preview"
              className="h-32 w-full rounded-xl object-cover"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const AiChatStep = ({
  draft,
  onAnalyse,
  onCopy,
  loading,
  onFieldChange
}: {
  draft: ListingDraft;
  onAnalyse: () => void;
  onCopy: () => void;
  loading: boolean;
  onFieldChange: (updates: Partial<ListingDraft>) => void;
}) => {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">AI Assistant</h2>
        <p className="text-sm text-slate-600">
          Our AI analyses your photos and guides you through missing details. Click "Analyse" to run
          the computer vision step.
        </p>
        <Button onClick={onAnalyse} disabled={loading || draft.images.length === 0}>
          {loading ? 'Working…' : 'Analyse photos'}
        </Button>
        <Button
          variant="outline"
          onClick={onCopy}
          disabled={loading || !draft.make || !draft.model || !draft.year}
        >
          Generate ad copy
        </Button>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p>
            Live preview updates automatically. You can edit any field and adjust the copy later in
            the preview step.
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <FieldEditor
          label="Make"
          value={draft.make ?? ''}
          confidence={draft.confidence.make}
          onChange={(value) => onFieldChange({ make: value })}
        />
        <FieldEditor
          label="Model"
          value={draft.model ?? ''}
          confidence={draft.confidence.model}
          onChange={(value) => onFieldChange({ model: value })}
        />
        <FieldEditor
          label="Year"
          value={draft.year?.toString() ?? ''}
          confidence={draft.confidence.year}
          onChange={(value) => onFieldChange({ year: value ? Number(value) : undefined })}
        />
        <FieldEditor
          label="Mileage (km)"
          value={draft.mileageKm?.toString() ?? ''}
          confidence={draft.confidence.mileageKm}
          onChange={(value) => onFieldChange({ mileageKm: value ? Number(value) : undefined })}
        />
        <FieldEditor
          label="Price (€)"
          value={draft.price?.toString() ?? ''}
          confidence={draft.confidence.price}
          onChange={(value) => onFieldChange({ price: value ? Number(value) : undefined })}
        />
        <FieldEditor
          label="Location region"
          value={draft.locationRegion ?? ''}
          confidence={draft.confidence.locationRegion}
          onChange={(value) => onFieldChange({ locationRegion: value })}
        />
        <FieldEditor
          label="Location city"
          value={draft.locationCity ?? ''}
          confidence={draft.confidence.locationCity}
          onChange={(value) => onFieldChange({ locationCity: value })}
        />
        <FieldEditor
          label="Title"
          value={draft.title ?? ''}
          confidence={draft.confidence.title}
          onChange={(value) => onFieldChange({ title: value })}
        />
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Generated description</span>
          <textarea
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            rows={5}
            value={draft.description ?? ''}
            onChange={(event) => onFieldChange({ description: event.target.value })}
          />
        </label>
      </div>
    </div>
  );
};

const FieldEditor = ({
  label,
  value,
  confidence,
  onChange
}: {
  label: string;
  value: string;
  confidence?: number;
  onChange: (value: string) => void;
}) => (
  <label className="block text-sm">
    <div className="flex items-center justify-between">
      <span className="font-medium text-slate-700">{label}</span>
      {confidence !== undefined ? (
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${confidence > 0.8 ? 'bg-green-100 text-green-800' : confidence > 0.5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
        >
          {(confidence * 100).toFixed(0)}%
        </span>
      ) : null}
    </div>
    <input
      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </label>
);

const PreviewStep = ({
  draft,
  publishing,
  onPublish
}: {
  draft: ListingDraft;
  publishing: boolean;
  onPublish: () => void;
}) => (
  <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2">
      {draft.images.map((image) => (
        <img key={image.url} src={image.url} alt="Preview" className="h-48 w-full rounded-2xl object-cover" />
      ))}
    </div>
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold text-slate-900">{draft.title ?? 'Listing title'}</h2>
      <p className="text-lg font-semibold text-brand">
        {draft.price ? `${draft.price.toLocaleString()} €` : 'Set a price'}
      </p>
      <p className="text-sm text-slate-600">Location: {[draft.locationCity, draft.locationRegion].filter(Boolean).join(', ')}</p>
      <p className="whitespace-pre-line text-sm text-slate-700">{draft.description}</p>
    </div>
    <Button onClick={onPublish} disabled={publishing}>
      {publishing ? 'Publishing…' : 'Publish listing'}
    </Button>
  </div>
);
