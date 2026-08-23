import { useState, useCallback, useEffect } from 'react';
import { BarcodeInventoryService } from '../services/barcode-inventory.service';
import type { 
  BarcodeItem, 
  CreateBarcodeItemDto,
  UpdateBarcodeItemDto
} from '../common/types/barcode-inventory.types';

export const useBarcodeInventory = (initialArchived = false) => {
  const [items, setItems] = useState<BarcodeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    karat: undefined as 18 | 21 | 24 | undefined,
    isArchived: initialArchived,
    search: '',
  });

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data: BarcodeItem[] = [];
      if (filters.isArchived) {
        data = await BarcodeInventoryService.getArchivedBarcodeItems();
      } else {
        data = await BarcodeInventoryService.getBarcodeItems(filters.karat);
      }
      
      if (filters.search) {
        const query = filters.search.toLowerCase();
        data = data.filter(
          item => 
            item.title.toLowerCase().includes(query) || 
            item.barcode.toLowerCase().includes(query) ||
            (item.companyName && item.companyName.toLowerCase().includes(query))
        );
      }
      
      setItems(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'فشل في جلب بيانات الباركود');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const createItem = async (data: CreateBarcodeItemDto) => {
    const newItem = await BarcodeInventoryService.createBarcodeItem(data);
    if (!filters.isArchived) {
      setItems(prev => [newItem, ...prev]);
    }
    return newItem;
  };

  const updateItem = async (id: string, data: UpdateBarcodeItemDto) => {
    const updated = await BarcodeInventoryService.updateBarcodeItem(id, data);
    setItems(prev => prev.map(item => item._id === id ? updated : item));
    return updated;
  };

  const archiveItem = async (id: string) => {
    await BarcodeInventoryService.archiveBarcodeItem(id);
    if (!filters.isArchived) {
      setItems(prev => prev.filter(item => item._id !== id));
    } else {
      fetchItems();
    }
  };
  
  const getPrintTag = async (barcode: string) => {
    return BarcodeInventoryService.getPrintTag(barcode);
  };

  const scanItem = async (barcode: string) => {
    return BarcodeInventoryService.scanBarcodeItem(barcode);
  };

  return {
    items,
    isLoading,
    error,
    filters,
    setFilters,
    fetchItems,
    createItem,
    updateItem,
    archiveItem,
    getPrintTag,
    scanItem,
  };
};
