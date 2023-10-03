'use client'

import { Loader2 } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useToast } from './ui/use-toast'

import { useResizeDetector } from 'react-resize-detector'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	'pdfjs-dist/build/pdf.worker.min.js',
	import.meta.url
).toString()

interface PdfRendererProps {
	url: string
}

const PdfRendeder = ({ url }: PdfRendererProps) => {
	const { toast } = useToast()

	const { width, ref } = useResizeDetector()

	return (
		<div className='w-full bg-white rounded-md shadow flex flex-col items-center'>
			<div className='h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2'>
				<div className='flex items-center gap-1.5'></div>
			</div>

			<div className='flex-1 w-full max-h-screen'>
				<div>
					<Document
						loading={
							<div className='flex justify-center'>
								<Loader2 className='my-24 w-6 h-6 animate-spin' />
							</div>
						}
						onLoadError={() => {
							toast({
								title: 'Error laoding pdf',
								description: 'Please try again later',
								variant: 'destructive',
							})
						}}
						file={url}
						className='max-h-full'
					>
						<Page width={width ? width : 1} pageNumber={1} />
					</Document>
				</div>
			</div>
		</div>
	)
}

export default PdfRendeder
