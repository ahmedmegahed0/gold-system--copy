import { useState, useCallback, useEffect } from 'react';
import { BarcodeInventoryService } from '../services/barcode-inventory.service';
import type { BarcodeInventoryItem, CreateBarcodeItemDto } from '../common/types/barcode.types';

export const useBarcodeInventory = (initialArchived = false) => {
  const [items, setItems] = useState<BarcodeInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    karat: undefined as number | undefined,
    isArchived: initialArchived,
    search: '',
  });

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data: BarcodeInventoryItem[] = [];
      if (filters.isArchived) {
        data = await BarcodeInventoryService.findAllArchived();
      } else {
        data = await BarcodeInventoryService.findAllAvailable(filters.karat);
      }
      
      if (filters.search) {
        const query = filters.search.toLowerCase();
        data = data.filter(
          item => 
            item.title.toLowerCase().includes(query) || 
            item.barcode.toLowerCase().includes(query) ||
            item.companyName.toLowerCase().includes(query)
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
    const newItem = await BarcodeInventoryService.createItem(data);
    if (!filters.isArchived) {
      setItems(prev => [newItem, ...prev]);
    }
    return newItem;
  };

  const updateItem = async (id: string, data: Partial<CreateBarcodeItemDto>) => {
    const updated = await BarcodeInventoryService.updateItem(id, data);
    setItems(prev => prev.map(item => item._id === id ? updated : item));
    return updated;
  };

  const archiveItem = async (id: string) => {
    await BarcodeInventoryService.softDelete(id);
    if (!filters.isArchived) {
      setItems(prev => prev.filter(item => item._id !== id));
    } else {
      fetchItems();
    }
  };
  
  const getPrintTag = async (barcode: string) => {
    return BarcodeInventoryService.getPrintTag(barcode);
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
  };
};
