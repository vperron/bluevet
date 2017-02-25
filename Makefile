include node_modules/systematic/mk/main.mk

BLEASE_MK = $(shell makefile_path js.mk 2>/dev/null)
ifneq ($(BLEASE_MK),)
  -include $(BLEASE_MK)
endif
