import { getContext, setContext } from 'svelte';

const MODAL_KEY = Symbol('modal');

export function createModalContext() {
	const modal = $state({
		isOpen: false,
		title: '',
		component: null as any,
		props: {} as any,
		confirmText: 'Confirm',
		cancelText: 'Cancel',
		variant: 'danger' as 'danger' | 'primary' | 'secondary',
		onConfirm: () => {},
		onCancel: () => {}
	});

	const showModal = (config: {
		title: string;
		component: any;
		props?: any;
		confirmText?: string;
		cancelText?: string;
		variant?: 'danger' | 'primary' | 'secondary';
		onConfirm: () => void;
		onCancel?: () => void;
	}) => {
		modal.isOpen = true;
		modal.title = config.title;
		modal.component = config.component;
		modal.props = config.props || {};
		modal.confirmText = config.confirmText || 'Confirm';
		modal.cancelText = config.cancelText || 'Cancel';
		modal.variant = config.variant || 'danger';
		modal.onConfirm = config.onConfirm;
		modal.onCancel = config.onCancel || hideModal;
	};

	const hideModal = () => {
		modal.isOpen = false;
		modal.title = '';
		modal.component = null;
		modal.props = {};
		modal.onConfirm = () => {};
		modal.onCancel = () => {};
	};

	const context = {
		modal,
		showModal,
		hideModal
	};

	setContext(MODAL_KEY, context);
	return context;
}

export function getModalContext() {
	return getContext<ReturnType<typeof createModalContext>>(MODAL_KEY);
}