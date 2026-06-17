"""Recycle bin routes — list, restore, and permanently delete soft-deleted items."""
from fastapi import APIRouter, Depends, HTTPException, Query

from services.auth_service import require_admin
from services.recycle_bin import list_bin, restore_item, purge_item

router = APIRouter(prefix="/recycle-bin", tags=["recycle-bin"])


@router.get("")
async def get_recycle_bin(
    user: dict = Depends(require_admin),
    collection: str = Query(None, description="Filter by original collection"),
):
    """Admin/Super Admin lists deleted items."""
    return await list_bin(collection)


@router.post("/{bin_id}/restore")
async def restore(bin_id: str, user: dict = Depends(require_admin)):
    """Restore a deleted item to its original collection."""
    ok = await restore_item(bin_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Recycle bin item not found")
    return {"message": "Item restored"}


@router.delete("/{bin_id}")
async def purge(bin_id: str, user: dict = Depends(require_admin)):
    """Permanently delete a single recycle-bin item."""
    ok = await purge_item(bin_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Recycle bin item not found")
    return {"message": "Item permanently deleted"}
