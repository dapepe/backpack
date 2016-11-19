<?php
namespace Backpack;

/**
 * Filesystem API
 *
 * @author Peter-Christoph Haider (Project Leader) et al.
 * @package Backpack
 * @version 1.1
 * @copyright Copyright (c) 2012-2014, Zeyon Technologies
 */
class FileAPI extends API {
	/**
	 * @var array An associative array mapping actions to their definitions.
	 *     Action format:    { <name> => [ <method>, <function>, <parameters> ] }
	 *       Methods:        POST, GET, REQUEST
	 *     Parameter format: [ <name>, <type>, <default> = '', <required> = true ]
	 *       Types:          int, float, bool, array, object, string
	 */
	public $actions = array(
		/*!
		 * @cmd list
		 * @method any
		 * @description Lists all files in a given directory
		 * @param {string} dir Directory path
		 * @return {array}
		 * @demo
		 */
		'list' => array('ANY', 'list', array(
			array('dir', 'string', false, false),
			array('query', 'array', false, false)
		)),
		/*!
		 * @cmd add
		 * @method any
		 * @description Creates a new file
		 * @param {string} file File path
		 * @param {bool} is_dir Flag, if file is a directory
		 * @return {array}
		 * @demo
		 */
		'add' => array('ANY', 'add', array(
			array('file', 'string', false),
			array('is_dir', 'bool', false, false),
		)),
		/*!
		 * @cmd read
		 * @method any
		 * @description Views a file
		 * @param {string} file File path
		 * @return {bool}
		 * @demo
		 */
		'read' => array('ANY', 'read', array(
			array('file', 'string', false),
		)),
		/*!
		 * @cmd write
		 * @method post
		 * @description Write a file
		 * @param {string} file File path
		 * @param {string} content File contents
		 * @return {bool}
		 * @demo
		 */
		'write' => array('POST', 'write', array(
			array('file', 'string', false),
			array('content', 'string', false),
		)),
		/*!
		 * @cmd remove
		 * @method any
		 * @description Removes a file
		 * @param {string} file File path
		 * @return bool
		 * @demo
		 */
		'remove' => array('ANY', 'remove', array(
			array('file', false, true),
		)),
		/*!
		 * @cmd upload
		 * @method any
		 * @description Removes a file
		 * @param {string} file File path
		 * @param {file} upload File upload
		 * @return {bool}
		 * @demo
		 */
		'upload' => array('POST', 'upload', array(
			array('file', 'file', false),
			array('path', 'string', false),
		)),
		/*!
		 * @cmd thumbnail
		 * @method get
		 * @description Return thumbnail raw data. Create thumbnail if not exist.
		 * @param {string} file Image path
		 * @return {bytes}
		 * @demo
		 */
		'thumbnail' => array('GET', 'thumbnail', array(
			array('file', 'string', false),
		)),
		/*!
		 * @cmd image
		 * @method get
		 * @description Return image raw data.
		 * @param {string} file Image path
		 * @return {bytes}
		 * @demo
		 */
		'image' => array('GET', 'image', array(
			array('file', 'string', false),
		)),
		/*!
		 * @cmd download
		 * @method get
		 * @description Return image raw data.
		 * @param {string} file Image path
		 * @return {bytes}
		 * @demo
		 */
		'download' => array('GET', 'download', array(
			array('file', 'string', false),
		)),
	);

	public $auth_exceptions = array();

	/**
	 * List all files in a directory
	 *
	 * @param  string $strDir
	 * @return array
	 */
	public function do_list($strDir, $arrQuery) {
		$this->requireConnection();
		$strDir = $this->app->checkFileLocation($strDir).DIRECTORY_SEPARATOR;

        $start = 0;
        $end = PHP_INT_MAX;
        if ( isset($arrQuery) && is_array($arrQuery) && isset($arrQuery['start']) && isset($arrQuery['end']) ) {
            $start = $arrQuery['start'];
            $end = $arrQuery['end'];
        }

        $access = new AccessRules($this->app->getSession('role'));

		$list = array();
        $i = 0;
		foreach (scandir($strDir) as $file) {
            if (substr($file, 0, 1) == '.')
                continue;

            if ( $i >= $start && $i < $end ) {
                if ( !$access->hasAccessFor(
                        FsAccess::file($this->app->getPathRelToAppDir($strDir.$file)),
                        AccessRules::READ,
                        false
                    ) )
                    continue;

                $list[] = [
                    'filename'  => $file,
                    'extension' => pathinfo($strDir.$file, PATHINFO_EXTENSION),
                    'is_dir'    => is_dir($strDir.$file)
                ];

            }
            $i++;
		}


		return $list;
	}

	/**
	 * Read a file
	 *
	 * @param  string $strFile File name
	 * @return string
	 */
	public function do_read($strFile) {
		$this->requireConnection();
		$strFile = $this->app->checkFileLocation($strFile);

        $access = new AccessRules($this->app->getSession('role'));
        $access->hasAccessFor(
            FsAccess::file($this->app->getPathRelToAppDir($strFile)),
            AccessRules::READ
        );

		return file_get_contents($strFile);
	}

	/**
	 * Creates a new file
	 *
	 * @param  string $strFile    File name
	 * @param  bool   $isDir
	 * @return array
	 */
	public function do_add($strFile, $isDir=false) {
		$this->requireConnection();
		$strFile = $this->app->checkFileLocation($strFile, false);

        // check if you have edit access to the parent directory
        $access = new AccessRules($this->app->getSession('role'));

        $checkFile = $this->app->getPathRelToAppDir($strFile);

        // cut last path segment
        $checkFile = substr($checkFile, 0, strrpos($checkFile, DIRECTORY_SEPARATOR));
        $access->hasAccessFor(FsAccess::file($checkFile),AccessRules::EDIT);

		$docTemplates = array(
			'xml' => '<?xml version="1.0" encoding="UTF-8"?>'."\n".'<xpage>'."\n\n".'</xpage>',
			'ixml' => '<?xml version="1.0" encoding="UTF-8"?>'."\n".'<!DOCTYPE ixml SYSTEM "http://www.ixmldev.com/schema/ixml.dtd">'."\n".'<ixml>'."\n\n".'</ixml>',
		);

		if ($isDir) {
			// Create a new directory
			if (is_dir($strFile))
				throw new \Exception('Directory already exists!');

			mkdir($strFile);
		} else {
			if (is_file($strFile))
				throw new \Exception('File already exists!');
			// Check, if file type is supported
			$ext = pathinfo($strFile, PATHINFO_EXTENSION);
			if (!in_array($ext, array(
				'css', 'html', 'html', 'ixml', 'js', 'json', 'less', 'txt', 'xml'
			))) {
				throw new \Exception('Unsupported file type');
			}

			file_put_contents($strFile, isset($docTemplates[$ext]) ? $docTemplates[$ext] : '');
		}

		return array(
			'filename'  => pathinfo($strFile, PATHINFO_BASENAME),
			'extension' => isset($ext) ? $ext : null,
			'is_dir'    => $isDir
		);
	}

	/**
	 * Write a file
	 *
	 * @param  string $strFile    File name
	 * @param  string $strContent The file contents
	 * @return bool
	 */
	public function do_write($strFile, $strContent) {
		$this->requireConnection();
		$strFile = $this->app->checkFileLocation($strFile, false);

        $access = new AccessRules($this->app->getSession('role'));
        $access->hasAccessFor(
            FsAccess::file($this->app->getPathRelToAppDir($strFile)),
            AccessRules::EDIT
        );

		// Check, if file type is supported
		if (!in_array(pathinfo($strFile, PATHINFO_EXTENSION), array(
			'css', 'html', 'html', 'ixml', 'js', 'json', 'less', 'txt', 'xml'
		))) {
			throw new Exception('Unsupported file type');
		}

		file_put_contents($strFile, $strContent);
		return true;
	}

	/**
	 * Remove a file form
	 *
	 * @param  string $strFile File name
	 * @return bool
	 */
	public function do_remove($mxFile) {
		$this->requireConnection();

        $access = new AccessRules($this->app->getSession('role'));

		if ( !is_array($mxFile) ) {
			$mxFile = $this->app->checkFileLocation($mxFile);

            $access->hasAccessFor(
                FsAccess::file($this->app->getPathRelToAppDir($mxFile)),
                AccessRules::EDIT
            );

			unlink($mxFile);

		} else {
			foreach( $mxFile as $file ) {
				$strFile = $this->app->checkFileLocation($file);

                $access->hasAccessFor(
                    FsAccess::file($this->app->getPathRelToAppDir($mxFile)),
                    AccessRules::EDIT
                );

				unlink($strFile);

			}
		}

		return true;
	}

	/**
	 * Processes a files upload
	 *
	 * @param  string $strFile File name
	 * @return bool
	 */
	public function do_upload($file, $strPath) {
		$this->requireConnection();
		$strPath = $this->app->checkFileLocation($strPath).DIRECTORY_SEPARATOR;

        $access = new AccessRules($this->app->getSession('role'));
        $access->hasAccessFor(
            FsAccess::file($this->app->getPathRelToAppDir($strPath)),
            AccessRules::EDIT
        );

		if ( file_exists($strPath.$file['name']) ) {
			throw new \Exception($strPath.$file['name'].' already exist!');
		}

		if ( !move_uploaded_file($file['tmp_name'], $strPath.$file['name']) ) {
			throw new \Exception('Error moving uploaded file: '.$file['name']);
		}

		return true;
	}

	/**
	 * Return thumbnail raw data. Create thumbnail if not exist.
	 *
	 * @param  string $strFile File name
	 * @return bytes
	 */
	public function do_thumbnail($strFile) {
		$this->requireConnection();
		$strFile = $this->app->checkFileLocation($strFile);

        $access = new AccessRules($this->app->getSession('role'));
        $access->hasAccessFor(
            FsAccess::file($this->app->getPathRelToAppDir($strFile)),
            AccessRules::READ
        );

		$thumbFile = CACHE_DIR.md5($strFile);
		if ( !file_exists($thumbFile) ) {
			$thumb = new \Imagick();
			$thumb->readImage($strFile);

			$imageprops = $thumb->getImageGeometry();
			if ($imageprops['width'] <= 100 && $imageprops['height'] <= 100) {
				// don't upscale
			} else {
				$thumb->resizeImage(100, 100, \Imagick::FILTER_POINT, 1, true);
			}

			$thumb->writeImage($thumbFile);
			$thumb->clear();
			$thumb->destroy();
		}

		$ext = explode('.', $strFile);
		$ext = $ext[count($ext)-1];

		header('Content-Type: '.\REST\Mime::getMimetypeByExtension($ext));
		echo file_get_contents($thumbFile);
		return new \REST\voidResult();
	}

	/**
	 * Return image raw data.
	 *
	 * @param  string $strFile File name
	 * @return bytes
	 */
	public function do_image($strFile) {
		$this->requireConnection();
		$strFile = $this->app->checkFileLocation($strFile);

        $access = new AccessRules($this->app->getSession('role'));
        $access->hasAccessFor(
            FsAccess::file($this->app->getPathRelToAppDir($strFile)),
            AccessRules::READ
        );

		$ext = explode('.', $strFile);
		$ext = $ext[count($ext)-1];

		header('Content-Type: '.\REST\Mime::getMimetypeByExtension($ext));
		echo file_get_contents($strFile);
		return new \REST\voidResult();
	}

	/**
	 * Return image raw data.
	 *
	 * @param  string $strFile File name
	 * @return bytes
	 */
	public function do_download($strFile) {
		$name = explode('/', $strFile);
		$this->requireConnection();
		$strFile = $this->app->checkFileLocation($strFile);

        $access = new AccessRules($this->app->getSession('role'));
        $access->hasAccessFor(
            FsAccess::file($this->app->getPathRelToAppDir($strFile)),
            AccessRules::READ
        );

		header('Content-Disposition: attachment; filename='.$name[count($name)-1]);
		header('Content-Type: application/force-download');

		echo file_get_contents($strFile);
		return new \REST\voidResult();
	}
}

?>
