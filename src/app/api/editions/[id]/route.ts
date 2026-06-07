import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const editionId = parseInt(params.id)
    
    if (isNaN(editionId)) {
      return NextResponse.json(
        { error: 'Invalid edition ID' },
        { status: 400 }
      )
    }

    const edition = await prisma.edition.findUnique({
      where: { id: editionId },
    })

    if (!edition) {
      return NextResponse.json(
        { error: 'Edition not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(edition)
  } catch (error) {
    console.error('Error fetching edition:', error)
    return NextResponse.json(
      { error: 'Failed to fetch edition' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  return NextResponse.json({ success: true, id: params.id, data: body })
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({ success: true, id: params.id })
}
