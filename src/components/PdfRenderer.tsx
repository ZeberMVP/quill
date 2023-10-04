'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, ChevronUp, Loader2, RotateCw, Search } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Document, Page, pdfjs } from 'react-pdf'
import { useResizeDetector } from 'react-resize-detector'
import { z } from 'zod'

import { Button } from './ui/button'
import { Input } from './ui/input'
import { useToast } from './ui/use-toast'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { cn } from '@/lib/utils'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './ui/dropdown-menu'

import SimpleBar from 'simplebar-react'
import PdfFullscreen from './PdfFullscreen'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	'pdfjs-dist/build/pdf.worker.min.js',
	import.meta.url
).toString()

interface PdfRendererProps {
	url: string
}

const PdfRendeder = ({ url }: PdfRendererProps) => {
	const { toast } = useToast()

	const [numPages, setNumPages] = useState<number>()
	const [currentPage, setCurrentPage] = useState(1)
	const [scale, setScale] = useState(1)
	const [rotation, setRotation] = useState(0)
	const [renderedScale, setRenderedScale] = useState<number | null>(null)

	const isLoading = renderedScale !== scale

	const CustomPageValidator = z.object({
		page: z
			.string()
			.refine((num) => Number(num) > 0 && Number(num) <= numPages!),
	})

	type TCustomPageValidator = z.infer<typeof CustomPageValidator>

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<TCustomPageValidator>({
		defaultValues: {
			page: '1',
		},
		resolver: zodResolver(CustomPageValidator),
	})

	const { width, ref } = useResizeDetector()

	const handlePageSubmit = ({ page }: TCustomPageValidator) => {
		setCurrentPage(Number(page))
		setValue('page', String(page))
	}

	return (
		<div className='w-full bg-white rounded-md shadow flex flex-col items-center'>
			<div className='h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2'>
				<div className='flex items-center gap-1.5'>
					<Button
						variant='ghost'
						aria-label='Previous page'
						disabled={currentPage <= 1}
						onClick={() => {
							setCurrentPage((prev) => (prev - 1 > 1 ? prev - 1 : 1))
							setValue('page', String(currentPage - 1))
						}}
					>
						<ChevronDown className='w-4 h-4' />
					</Button>

					<div className='flex items-center gap-1.5'>
						<Input
							{...register('page')}
							className={cn(
								'w-12 h-8',
								errors.page && 'focus-visible:ring-red-500'
							)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									handleSubmit(handlePageSubmit)()
								}
							}}
						/>
						<p className='text-zinc-700 text-sm space-x-1'>
							<span>/</span>
							<span>{numPages ?? 'X'}</span>
						</p>
					</div>

					<Button
						disabled={numPages === undefined || currentPage === numPages}
						onClick={() => {
							setCurrentPage((prev) =>
								prev + 1 > numPages! ? numPages! : prev + 1
							)
							setValue('page', String(currentPage + 1))
						}}
						variant='ghost'
						aria-label='Next page'
					>
						<ChevronUp className='w-4 h-4' />
					</Button>
				</div>

				<div className='space-x-2'>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button className='gap-1.5' aria-label='zoom' variant='ghost'>
								<Search className='w-4 h-4' />
								{scale * 100}%<ChevronDown className='w-3 h-3 opacity-50' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem onSelect={() => setScale(1)}>
								100%
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => setScale(1.5)}>
								150%
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => setScale(2)}>
								200%
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => setScale(2.5)}>
								250%
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<Button
						aria-label='rotate 90 degrees'
						variant='ghost'
						onClick={() => setRotation((prev) => prev + 90)}
					>
						<RotateCw className='w-4 h-4' />
					</Button>

					<PdfFullscreen fileUrl={url} />
				</div>
			</div>

			<div className='flex-1 w-full max-h-screen'>
				<SimpleBar autoHide={false} className='max-h-[calc(100vh-10rem)]'>
					<div ref={ref}>
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
							onLoadSuccess={({ numPages }) => {
								setNumPages(numPages)
							}}
							file={url}
							className='max-h-full'
						>
							{isLoading && renderedScale ? (
								<Page
									width={width ? width : 1}
									pageNumber={currentPage}
									scale={scale}
									rotate={rotation}
									key={'@' + renderedScale}
								/>
							) : null}

							<Page
								className={cn(isLoading ? 'hidden' : '')}
								width={width ? width : 1}
								pageNumber={currentPage}
								scale={scale}
								rotate={rotation}
								key={'@' + scale}
								loading={
									<div className='flex justify-center'>
										<Loader2 className='my-24 w-6 h-6 animate-spin' />
									</div>
								}
								onRenderSuccess={() => setRenderedScale(scale)}
							/>
						</Document>
					</div>
				</SimpleBar>
			</div>
		</div>
	)
}

export default PdfRendeder
