// src/hooks/usePagination.js
import { useState, useMemo } from "react";

const usePagination = (data = [], itemsPerPage = 10, options = {}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { onPageChange } = options;

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page) => {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
      if (onPageChange) {
        onPageChange(targetPage);
      }
    }
  };

  const nextPage = () => {
    goToPage(currentPage + 1);
  };

  const prevPage = () => {
    goToPage(currentPage - 1);
  };

  const getPageNumbers = (visiblePages = 5) => {
    const pages = [];
    const half = Math.floor(visiblePages / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + visiblePages - 1);

    if (end - start + 1 < visiblePages) {
      start = Math.max(1, end - visiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const getPageInfo = () => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return {
      startItem,
      endItem,
      totalItems,
      currentPage,
      totalPages,
      itemsPerPage,
    };
  };

  return {
    currentPage,
    totalPages,
    totalItems,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    getPageNumbers,
    getPageInfo,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
  };
};

export default usePagination;
