"use client";

import {
	createContext,
	useContext,
	useState,
	useCallback,
	useRef,
	ReactNode,
} from "react";

export type ToastType = "error" | "warning" | "success" | "info";

export interface ToastOptions {
	type?: ToastType;
	title?: string;
	message?: string;
	duration?: number;
	onUndo?: () => void;
}

interface ToastData extends Required<Pick<ToastOptions, "type">> {
	id: number;
	title?: string;
	message?: string;
	onUndo?: () => void;
}

interface ToastContextType {
	toast: (options: ToastOptions) => number;
	dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) throw new Error("useToast must be used inside ToastProvider");
	return context;
}

const ICONS: Record<ToastType, ReactNode> = {
	error: (
		<svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
			<path
				fillRule="evenodd"
				d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
				clipRule="evenodd"
			/>
		</svg>
	),
	warning: (
		<svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
			<path
				fillRule="evenodd"
				d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
				clipRule="evenodd"
			/>
		</svg>
	),
	success: (
		<svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
			<path
				fillRule="evenodd"
				d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
				clipRule="evenodd"
			/>
		</svg>
	),
	info: (
		<svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
			<path
				fillRule="evenodd"
				d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
				clipRule="evenodd"
			/>
		</svg>
	),
};

const STYLES: Record<
	ToastType,
	{ bar: string; icon: string; bg: string; title: string }
> = {
	error: {
		bar: "bg-red-500",
		icon: "text-red-400",
		bg: "bg-[#1a0a0a] border-red-900/60",
		title: "text-red-300",
	},
	warning: {
		bar: "bg-amber-500",
		icon: "text-amber-400",
		bg: "bg-[#1a1200] border-amber-900/60",
		title: "text-amber-300",
	},
	success: {
		bar: "bg-emerald-500",
		icon: "text-emerald-400",
		bg: "bg-[#0a1a0f] border-emerald-900/60",
		title: "text-emerald-300",
	},
	info: {
		bar: "bg-violet-500",
		icon: "text-violet-400",
		bg: "bg-[#0d0a1a] border-violet-900/60",
		title: "text-violet-300",
	},
};

function ToastItem({
	t,
	onDismiss,
}: {
	t: ToastData;
	onDismiss: (id: number) => void;
}) {
	const style = STYLES[t.type];
	return (
		<div
			className={`
        relative flex items-start gap-3 w-80 rounded-xl border px-4 py-3.5
        shadow-2xl backdrop-blur-md overflow-hidden
        animate-in slide-in-from-right-4 fade-in duration-300
        ${style.bg}
      `}
		>
			<div className={`absolute left-0 top-0 h-full w-0.5 ${style.bar}`} />

			<span className={`mt-0.5 shrink-0 ${style.icon}`}>{ICONS[t.type]}</span>

			<div className="flex-1 min-w-0">
				{t.title && (
					<p
						className={`text-[12px] font-bold uppercase tracking-wide ${style.title}`}
					>
						{t.title}
					</p>
				)}
				{t.message && (
					<p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
						{t.message}
					</p>
				)}
			</div>

			{t.onUndo && (
				<button
					onClick={() => {
						t.onUndo?.();
						onDismiss(t.id);
					}}
					className="shrink-0 mt-0.5 text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
				>
					Cofnij
				</button>
			)}

			<button
				onClick={() => onDismiss(t.id)}
				className="shrink-0 mt-0.5 text-slate-600 hover:text-slate-300 transition-colors"
			>
				<svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
					<path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
				</svg>
			</button>
		</div>
	);
}

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<ToastData[]>([]);
	const idRef = useRef(0);

	const dismiss = useCallback((id: number) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const toast = useCallback(
		({
			type = "info",
			title,
			message,
			duration = 5000,
			onUndo,
		}: ToastOptions) => {
			const id = ++idRef.current;
			setToasts((prev) => [...prev, { id, type, title, message, onUndo }]);
			if (duration > 0) setTimeout(() => dismiss(id), duration);
			return id;
		},
		[dismiss],
	);

	return (
		<ToastContext.Provider value={{ toast, dismiss }}>
			{children}
			<div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
				{toasts.map((t) => (
					<div key={t.id} className="pointer-events-auto">
						<ToastItem t={t} onDismiss={dismiss} />
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}
