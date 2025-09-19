import { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { fixTitle } from '../util/utils'
import { Button } from './ui/button'
import { ScrollArea, ScrollBar } from './ui/scroll-area'

interface DataTableProps<T> {
    /** called whenever offset or query changes */
    fetchData: (args: { offset: number; query: string }) => Promise<T[]>
    /** name shown above the table */
    title: string
    /** optional columns override */
    columns?: string[]
    /** how many rows per “page” */
    pageSize?: number
    /** render a cell (allows formatting) */
    renderCell?: (col: string, value: any, row: T) => React.ReactNode // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function DataTable<T extends Record<string, any>>({ // eslint-disable-line @typescript-eslint/no-explicit-any
    fetchData,
    title,
    columns,
    pageSize = 1000,
    renderCell
}: DataTableProps<T>) {
    const [offset, setOffset] = useState(0)
    const [query, setQuery] = useState('')
    const [data, setData] = useState<T[]>([])

    useEffect(() => {
        fetchData({ offset, query }).then(setData)
    }, [offset, query, fetchData])

    const handlePrev = () => setOffset(prev => Math.max(prev - pageSize, 0))
    const handleNext = () => {
        if (data.length < pageSize) return
        setOffset(prev => prev + pageSize)
    }

    const cols = columns ?? (data.length > 0 ? Object.keys(data[0]) : [])

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor={`${title}-query`}>{title} Query:</Label>
                <Textarea
                    id={`${title}-query`}
                    placeholder="Enter SoQL or filter query"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
            </div>

            <h2>{title}</h2>
            <ScrollArea className="relative h-[450px] max-h-[450px] overflow-auto border rounded">
                {data.length > 0 ? (
                    <Table>
                        <TableCaption>{title} Data</TableCaption>
                        <TableHeader>
                            <TableRow>
                                {cols.map(col => (
                                    <TableHead key={col} className="border-0 bg-white shadow-border shadow-[inset_0_-1px_0]">
                                        <div className="flex flex-col">
                                            <span className="select-none">{fixTitle(col)}</span>
                                            <div>
                                                <span className="text-gray-400 text-xs select-none">(</span>
                                                <span className="text-gray-400 text-xs select-all">{col}</span>
                                                <span className="text-gray-400 text-xs select-none">)</span>
                                            </div>
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row, i) => (
                                <TableRow key={i}>
                                    {cols.map(col => (
                                        <TableCell key={col}>
                                            {renderCell ? renderCell(col, row[col], row) : row[col]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="flex items-center justify-center">NO DATA</div>
                )}
                <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="flex gap-2">
                <Button onClick={handlePrev} className="cursor-pointer">Prev</Button>
                <Button onClick={handleNext} className="cursor-pointer">Next</Button>
            </div>
        </div>
    )
}
